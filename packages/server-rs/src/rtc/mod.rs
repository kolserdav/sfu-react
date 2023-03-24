use std::{collections::HashMap, sync::Arc};

use futures::executor::block_on;
use tokio::sync::{Mutex, MutexGuard};

use serde::Serialize;
use webrtc::{
    api::{
        interceptor_registry::register_default_interceptors, media_engine::MediaEngine, APIBuilder,
    },
    ice_transport::{ice_candidate::RTCIceCandidate, ice_server::RTCIceServer},
    interceptor::registry::Registry,
    peer_connection::{
        configuration::RTCConfiguration, peer_connection_state::RTCPeerConnectionState,
        sdp::session_description::RTCSessionDescription, signaling_state::RTCSignalingState,
        RTCPeerConnection,
    },
    rtp_transceiver::rtp_codec::RTPCodecType,
};

use crate::{
    common::{Room, RoomsMutex},
    prelude::{constants::DELIMITER, get_peer_id, get_peer_id_with_kind},
    ws::messages::{
        Candidate, EventName, MessageArgs, MessageType, Offer, RoomList, SetChangeUnit,
    },
};

pub mod track;
use track::Track;

#[derive(Serialize, Debug)]
#[allow(non_snake_case)]
pub struct User {
    pub id: String,
    pub name: String,
    pub isOwner: bool,
}

type Candidates = Arc<Vec<RTCIceCandidate>>;

#[derive(Debug)]

pub struct RTC {
    pub peers: Mutex<HashMap<String, Arc<RTCPeerConnection>>>,
    pub candidates: Mutex<HashMap<String, Candidates>>,
    pub users: Mutex<HashMap<String, String>>,
    pub rooms: Mutex<Vec<Room<User>>>,
    pub askeds: Mutex<Vec<RoomList>>,
    pub streams: Mutex<HashMap<String, Arc<Track>>>,
}

impl RTC {
    pub fn new() -> Self {
        Self {
            candidates: Mutex::new(HashMap::new()),
            peers: Mutex::new(HashMap::new()),
            rooms: Mutex::new(Vec::new()),
            askeds: Mutex::new(Vec::new()),
            users: Mutex::new(HashMap::new()),
            streams: Mutex::new(HashMap::new()),
        }
    }

    pub async fn add_room(&self, room_id: String) -> Option<usize> {
        let mut rooms = self.rooms.lock().await;
        let mut index_r = rooms.iter().position(|room| *room.room_id == room_id);
        if let None = index_r {
            rooms.push(Room {
                room_id: room_id.clone(),
                users: Vec::new(),
            });
            index_r = Some(rooms.len() - 1);
        }
        index_r
    }

    async fn set_user(&self, user_id: String, conn_id: String) {
        let mut users = self.users.lock().await;
        let user = users.get(&user_id);
        if let Some(_) = user {
            warn!("Duplicate user in RTC: {}", &user_id);
            users.remove(&user_id);
        }
        users.insert(user_id, conn_id);
    }

    async fn get_conn_id(&self, user_id: &String) -> Option<String> {
        let users = self.users.lock().await;
        let res = users.get(user_id);
        if let None = res {
            return None;
        }
        Some(res.unwrap().clone())
    }

    async fn delete_user(&self, user_id: &String) {
        let mut users = self.users.lock().await;
        let user = users.get(user_id);
        if let None = user {
            warn!("Deleted user is missing in RTC.delete_user: {}", &user_id);
            return;
        }
        users.remove(user_id);
    }

    pub async fn add_user_to_room(&self, room_id: String, user_id: String) {
        let index_r = self.add_room(room_id.clone()).await.unwrap();
        let mut rooms = self.rooms.lock().await;
        let index = rooms[index_r]
            .users
            .iter()
            .position(|user| *user.id == user_id);
        if let Some(_) = index {
            warn!("Duplicate user: {}", user_id);
            return;
        }
        info!("Add user: {} to room: {}", &user_id, &room_id);
        rooms[index_r].users.push(User {
            id: user_id,
            name: "TODO".to_string(),
            // TODO
            isOwner: true,
        })
    }

    async fn find_rooms_indexes(
        &self,
        user_id: &String,
    ) -> (Option<usize>, Option<usize>, RoomsMutex<User>) {
        let mut i = 0;
        let mut index_r = None;
        let mut index_u = None;
        let rooms = self.rooms.lock().await;
        for room in rooms.iter() {
            let index = room.users.iter().position(|u| *u.id == *user_id);
            if let Some(v) = index {
                index_r = Some(i);
                index_u = Some(v);
                break;
            }
            i += 1;
        }
        (index_r, index_u, rooms)
    }

    async fn find_askeds_indexes(
        &self,
        user_id: &String,
    ) -> (Option<usize>, Option<usize>, MutexGuard<Vec<RoomList>>) {
        let mut i = 0;
        let mut index_r = None;
        let mut index_u = None;
        let askeds = self.askeds.lock().await;
        for asked in askeds.iter() {
            let index = asked.users.iter().position(|u| *u == *user_id);
            if let Some(v) = index {
                index_r = Some(i);
                index_u = Some(v);
                break;
            }
            i += 1;
        }
        (index_r, index_u, askeds)
    }

    pub async fn delete_user_from_room(&self, user_id: &String) {
        let (index_r, index_u, mut rooms) = self.find_rooms_indexes(user_id).await;
        if let None = index_r {
            warn!("Room is missing in delete_user_from_room: {}", &user_id);
            return;
        }
        let index_r = index_r.unwrap();
        if let None = index_u {
            warn!("User is missing in delete_user_from_room: {}", &user_id);
            return;
        }
        let index_u = index_u.unwrap();
        debug!("RTC user deleted: {}", &user_id);

        self.delete_user(&user_id).await;

        self.close_peer_connection(user_id).await;

        rooms[index_r].users.remove(index_u);
    }

    pub async fn close_peer_connection(&self, user_id: &String) {
        let peers = self.peers.lock().await;
        for (peer_id, peer_connection) in peers.iter() {
            let peer = peer_id.split(DELIMITER).collect::<Vec<&str>>();
            if user_id == peer[0] || user_id == peer[1] {
                debug!("Close peer connection: {}", &peer_id);
                peer_connection.close().await.unwrap();
            }
        }
    }

    pub async fn delete_askeds(&self, user_id: &String) {
        let (index_r, index_u, mut askeds) = self.find_askeds_indexes(user_id).await;
        if let None = index_r {
            warn!("Room is missing in delete_askeds: {}", &user_id);
            return;
        }
        let index_r = index_r.unwrap();
        if let None = index_u {
            warn!("User is missing in delete_askeds: {}", &user_id);
            return;
        }
        let index_u = index_u.unwrap();

        askeds[index_r].users.remove(index_u);
    }

    async fn create_askeds(&self, room_id: String) -> Option<usize> {
        let mut askeds = self.askeds.lock().await;
        let mut index_a = askeds.iter().position(|asked| *asked.room_id == room_id);
        if let None = index_a {
            askeds.push(RoomList {
                room_id: room_id.clone(),
                users: Vec::new(),
            });
            index_a = Some(askeds.len() - 1);
        }
        index_a
    }

    pub async fn add_user_to_askeds(&self, room_id: String, user_id: String) -> Vec<String> {
        let index_a = self.create_askeds(room_id).await.unwrap();
        let mut askeds = self.askeds.lock().await;
        let index = askeds[index_a]
            .users
            .iter()
            .position(|user| *user == user_id);
        if let Some(_) = index {
            warn!(
                "Duplicate askeds index; room_id: {}; user_id: {}",
                index_a, user_id
            );
            return askeds[index_a].users.to_vec();
        }
        askeds[index_a].users.push(user_id.clone());
        askeds[index_a].users.to_vec()
    }

    async fn set_peer_connection(&self, peer_id: String, peer_connection: Arc<RTCPeerConnection>) {
        let mut peers = self.peers.lock().await;
        // TODO check
        peers.insert(peer_id, peer_connection);
    }

    pub async fn candidate(&self, msg: MessageArgs<Candidate>) {
        debug!("Handle candidate: {}", msg);

        let peer_id = get_peer_id(msg.data.userId, msg.data.target, msg.connId);
        let peers = self.peers.lock().await;

        let peer_connection = peers.get(&peer_id);
        if let None = peer_connection {
            warn!("Skip add ice candidate");
            return;
        }
        let peer_connection = peer_connection.unwrap();

        let add_ice_res = peer_connection.add_ice_candidate(msg.data.candidate).await;
        if let Err(e) = add_ice_res {
            error!("Failed add ice {} candidate: {:?}", &peer_id, e);
        }
    }

    pub async fn offer<C, T>(
        &'static self,
        msg: MessageArgs<Offer>,
        cb_cand: C,
        cb_track: T,
    ) -> Option<RTCSessionDescription>
    where
        C: FnMut(MessageArgs<Candidate>) + Sync + Send + Copy + 'static,
        T: FnMut(MessageArgs<SetChangeUnit>) + Sync + Send + Copy + 'static,
    {
        debug!("Handle offer: {}", msg);

        let config = RTCConfiguration {
            ice_servers: vec![RTCIceServer {
                urls: vec!["stun:127.0.0.1:3478".to_owned()],
                ..Default::default()
            }],
            ..Default::default()
        };

        let mut m = MediaEngine::default();
        m.register_default_codecs().expect("Failed register codec");

        let mut registry = Registry::new();

        registry = register_default_interceptors(registry, &mut m)
            .expect("Failed register default intercepors");

        let api = APIBuilder::new()
            .with_media_engine(m)
            .with_interceptor_registry(registry)
            .build();

        let peer_connection = Arc::new(
            api.new_peer_connection(config)
                .await
                .expect("Failed create peer connection"),
        );
        let peer_id = get_peer_id(
            msg.data.userId.clone(),
            msg.data.target.clone(),
            msg.connId.clone(),
        );

        self.set_user(msg.data.userId.clone(), msg.connId.clone())
            .await;

        self.set_peer_connection(peer_id.clone(), peer_connection)
            .await;
        self.set_candidates(peer_id, Arc::new(Vec::new())).await;

        self.handle_ice_candidates(msg, cb_cand, cb_track).await
    }

    async fn set_candidates(&self, peer_id: String, cands: Candidates) {
        let mut candidates = self.candidates.lock().await;
        // TODO check
        candidates.insert(peer_id, cands);
    }

    async fn handle_ice_candidates<C, T>(
        &'static self,
        msg: MessageArgs<Offer>,
        cb_cand: C,
        cb_track: T,
    ) -> Option<RTCSessionDescription>
    where
        C: FnMut(MessageArgs<Candidate>) + Sync + Send + Copy + 'static,
        T: FnMut(MessageArgs<SetChangeUnit>) + Sync + Send + Copy + 'static,
    {
        let peer_id = get_peer_id(
            msg.data.userId.clone(),
            msg.data.target.clone(),
            msg.connId.clone(),
        );

        let peers = self.peers.lock().await;

        let peer_connection = peers.get(&peer_id);
        if let None = peer_connection {
            warn!("Skip handle ice candidate");
            return None;
        }
        let peer_connection = peer_connection.unwrap();

        let peer_id_c = peer_id.clone();
        peer_connection.on_peer_connection_state_change(Box::new(
            move |s: RTCPeerConnectionState| {
                if s == RTCPeerConnectionState::Failed {
                    error!("Peer Connection has gone to failed exiting");
                } else {
                    info!("Peer connection {} state changed to: {}", &peer_id_c, &s);
                }

                Box::pin(async {})
            },
        ));

        let peer_id_c = peer_id.clone();
        let target_c = msg.data.target.clone();
        let this = Arc::new(self);
        peer_connection.on_signaling_state_change(Box::new(move |s| {
            let this = this.clone();
            if RTCSignalingState::HaveRemoteOffer == s {
                let peers = block_on(self.peers.lock());

                let peer_connection = peers.get(&peer_id_c);
                if let None = peer_connection {
                    warn!("Skip send track: {}", &peer_id_c);
                    return Box::pin(async {});
                }
                let peer_connection = peer_connection.unwrap();

                let stream_conn_id = block_on(this.get_conn_id(&target_c));
                if let None = stream_conn_id {
                    warn!(
                        "Conn id is missing on have_remote_offer: {}, {}",
                        &peer_id_c, &target_c
                    );
                    return Box::pin(async {});
                }
                let stream_conn_id = stream_conn_id.unwrap();

                let peer_id = get_peer_id(target_c.clone(), String::from("0"), stream_conn_id);
                let peer_id_video = get_peer_id_with_kind(peer_id.clone(), RTPCodecType::Video);
                let peer_id_audio = get_peer_id_with_kind(peer_id.clone(), RTPCodecType::Audio);

                let streams = block_on(this.streams.lock());

                let stream_a = streams.get(&peer_id_audio);
                if let Some(s) = stream_a {
                    peer_connection.add_track(s.to_owned());
                }

                let stream_v = streams.get(&peer_id_video);
                if let Some(s) = stream_v {
                    peer_connection.add_track(s.to_owned());
                }
            }
            Box::pin(async {})
        }));

        let candidates = self.candidates.lock().await;
        let candidates = candidates.get(&peer_id);
        if let None = candidates {
            warn!("Connection candidates is missing: {peer_id}");
            return None;
        }
        // let candidates = candidates.unwrap();

        let pc = Arc::downgrade(&peer_connection);
        // let pending_candidates2 = Arc::clone(candidates);

        let sdp = msg.data.sdp.clone();
        let msg_c = msg.clone();
        let msg = Arc::new(msg);
        let msg_t = msg.clone();

        peer_connection.on_ice_candidate(Box::new(move |c: Option<RTCIceCandidate>| {
            let pc2 = pc.clone();
            // let pending_candidates3 = Arc::clone(&pending_candidates2);
            let msg = msg.clone();
            let mut cb_cand = cb_cand.clone();
            Box::pin(async move {
                if let Some(candidate) = c {
                    info!("on_ice_candidate {:?}", candidate);
                    if let Some(pc) = pc2.upgrade() {
                        let desc = pc.remote_description().await;
                        if desc.is_none() {
                            error!("Missing remote description in on_ice_candidate");
                        }

                        cb_cand(MessageArgs {
                            id: msg.data.userId.clone(),
                            connId: msg.connId.clone(),
                            r#type: MessageType::CANDIDATE,
                            data: Candidate {
                                candidate: candidate.to_json().unwrap(),
                                roomId: msg.data.roomId.clone(),
                                userId: msg.data.userId.clone(),
                                target: msg.data.target.clone(),
                            },
                        })
                    } else {
                        warn!("Peer connection is missing in on_ice_candidate");
                    }
                }
            })
        }));

        let this = Arc::new(self);

        peer_connection.on_track(Box::new(move |track, _, _| {
            let msg = msg_t.clone();
            let peer_id = get_peer_id(
                msg.data.userId.clone(),
                msg.data.target.clone(),
                msg.connId.clone(),
            );

            let is_room = msg.data.target.clone() == "0";

            if is_room && track.kind() == RTPCodecType::Video {
                {
                    let mut streams = block_on(this.streams.lock());

                    let peer_id = get_peer_id_with_kind(peer_id, track.kind());
                    info!("Save track: {} to peer: {}", &track.kind(), &peer_id);
                    streams.insert(peer_id, Arc::new(Track(track.clone())));
                    drop(streams);
                }

                let rooms = block_on(this.rooms.lock());
                let (index_r, _, askeds) = block_on(this.find_askeds_indexes(&msg.data.userId));
                if let None = index_r {
                    warn!("Index of room is missing in on_track: {}", &msg.data.userId);
                    return Box::pin(async {});
                }
                let index_r = index_r.unwrap();

                for room in rooms.iter() {
                    let mut cb_track = cb_track.clone();
                    if room.room_id == msg.data.roomId {
                        for user in room.users.iter() {
                            cb_track(MessageArgs::<SetChangeUnit> {
                                id: user.id.clone(),
                                connId: msg.connId.clone(),
                                r#type: MessageType::SET_CHANGE_UNIT,
                                data: SetChangeUnit {
                                    target: msg.data.userId.clone(),
                                    name: "TODO".to_string(),
                                    eventName: EventName::Add.to_string(),
                                    roomLength: room.users.len(),
                                    isOwner: true,
                                    // FIXME
                                    asked: askeds[index_r].users.to_vec(),
                                    muteds: vec![],
                                    banneds: vec![],
                                    adminMuteds: vec![],
                                },
                            });
                        }

                        break;
                    }
                }
                drop(rooms);
            }

            Box::pin(async {})
        }));

        let rem_desc = peer_connection.set_remote_description(sdp).await;
        if let Err(e) = rem_desc {
            error!("Error set remote description: {}", e);
            return None;
        }

        let answer = peer_connection.create_answer(None).await;
        if let Err(e) = answer {
            error!("Error create answer: {}", e);
            return None;
        }
        let answer = answer.unwrap();

        // let mut gather_complete = peer_connection.gathering_complete_promise().await;

        let local_desc = peer_connection.set_local_description(answer.clone()).await;
        if let Err(e) = local_desc {
            error!("Failed set local description: {e:?}, {}", msg_c);
            return None;
        }

        Some(answer)
    }
}
