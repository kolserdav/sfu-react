use std::{collections::HashMap, sync::Arc};

use tokio::sync::{Mutex, MutexGuard};

use serde::Serialize;
use webrtc::{
    api::{
        interceptor_registry::register_default_interceptors, media_engine::MediaEngine, APIBuilder,
    },
    ice_transport::ice_server::RTCIceServer,
    interceptor::registry::Registry,
    peer_connection::{configuration::RTCConfiguration, RTCPeerConnection},
};

use crate::{
    common::{Room, RoomsMutex},
    prelude::get_peer_id,
    ws::messages::{Candidate, MessageArgs, Offer, RoomList},
};

#[derive(Serialize, Debug)]
#[allow(non_snake_case)]
pub struct User {
    pub id: String,
    pub name: String,
    pub isOwner: bool,
}

#[derive(Debug)]

pub struct RTC {
    pub peers: Mutex<HashMap<String, Arc<RTCPeerConnection>>>,
    pub rooms: Mutex<Vec<Room<User>>>,
    pub askeds: Mutex<Vec<RoomList>>,
}

impl RTC {
    pub fn new() -> Self {
        Self {
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

    pub async fn offer(&self, msg: MessageArgs<Offer>) {
        debug!("Handle offer: {}", msg);

        let config = RTCConfiguration {
            ice_servers: vec![RTCIceServer {
                urls: vec!["stun:stun.l.google.com:19302".to_owned()],
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
        let peer_id = get_peer_id(msg.data.userId, msg.data.target, msg.connId);

        self.set_peer_connection(peer_id, peer_connection).await;
    }
}
