use std::{collections::HashMap, rc::Rc, sync::Arc};

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
        sdp::session_description::RTCSessionDescription, RTCPeerConnection,
    },
};

use crate::{
    common::{Room, RoomsMutex},
    prelude::get_peer_id,
    ws::messages::{Candidate, MessageArgs, MessageType, Offer, RoomList},
};

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
    pub rooms: Mutex<Vec<Room<User>>>,
    pub askeds: Mutex<Vec<RoomList>>,
}

impl RTC {
    pub fn new() -> Self {
        Self {
            candidates: Mutex::new(HashMap::new()),
            peers: Mutex::new(HashMap::new()),
            rooms: Mutex::new(Vec::new()),
            askeds: Mutex::new(Vec::new()),
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

    pub async fn add_user_to_room(&self, room_id: String, user_id: String) {
        let index_r = self.add_room(room_id).await.unwrap();
        let mut rooms = self.rooms.lock().await;
        let index = rooms[index_r]
            .users
            .iter()
            .position(|user| *user.id == user_id);
        if let Some(_) = index {
            warn!("Duplicate user: {}", user_id);
            return;
        }
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
        info!("User deleted: {}", &user_id);
        rooms[index_r].users.remove(index_u);
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

        peer_connection
            .add_ice_candidate(msg.data.candidate)
            .await
            .expect("Error add ice candidate");
    }

    pub async fn offer<F>(&self, msg: MessageArgs<Offer>, cb: F) -> Option<RTCSessionDescription>
    where
        F: FnMut(MessageArgs<Candidate>) + Sync + Send + Copy + 'static,
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

        self.set_peer_connection(peer_id.clone(), peer_connection)
            .await;
        self.set_candidates(peer_id, Arc::new(Vec::new())).await;

        self.handle_ice_candidates(msg, cb).await
    }

    async fn set_candidates(&self, peer_id: String, cands: Candidates) {
        let mut candidates = self.candidates.lock().await;
        // TODO check
        candidates.insert(peer_id, cands);
    }

    async fn handle_ice_candidates<F>(
        &self,
        msg: MessageArgs<Offer>,
        cb: F,
    ) -> Option<RTCSessionDescription>
    where
        F: FnMut(MessageArgs<Candidate>) + Sync + Send + Copy + 'static,
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

        peer_connection.on_peer_connection_state_change(Box::new(
            move |s: RTCPeerConnectionState| {
                if s == RTCPeerConnectionState::Failed {
                    error!("Peer Connection has gone to failed exiting");
                }

                Box::pin(async {})
            },
        ));

        let candidates = self.candidates.lock().await;
        let candidates = candidates.get(&peer_id);
        if let None = candidates {
            warn!("Connection candidates is missing: {peer_id}");
            return None;
        }
        let candidates = candidates.unwrap();

        let pc = Arc::downgrade(&peer_connection);
        let pending_candidates2 = Arc::clone(candidates);

        let sdp = msg.data.sdp.clone();
        let msg_c = msg.clone();
        let msg = Arc::new(msg);

        peer_connection.on_ice_candidate(Box::new(move |c: Option<RTCIceCandidate>| {
            info!("on_ice_candidate {:?}", c);

            let pc2 = pc.clone();
            let pending_candidates3 = Arc::clone(&pending_candidates2);
            let msg = msg.clone();
            let mut cb = cb.clone();
            Box::pin(async move {
                if let Some(c) = c {
                    if let Some(pc) = pc2.upgrade() {
                        let desc = pc.remote_description().await;
                        if desc.is_none() {
                            error!("Missing remote description in on_ice_candidate");
                        }
                        cb(MessageArgs {
                            id: msg.data.userId.clone(),
                            connId: msg.connId.clone(),
                            r#type: MessageType::CANDIDATE,
                            data: Candidate {
                                candidate: c.to_json().unwrap(),
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

        peer_connection.on_track(Box::new(move |track, _, _| {
            error!("track {:?}", track);
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

        let mut gather_complete = peer_connection.gathering_complete_promise().await;

        let local_desc = peer_connection.set_local_description(answer.clone()).await;
        if let Err(e) = local_desc {
            error!("Failed set local description: {e:?}, {}", msg_c);
            return None;
        }

        Some(answer)
    }
}
