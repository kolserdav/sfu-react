use std::sync::MutexGuard;

use serde::Serialize;
use uuid::Uuid;

use crate::ws::{
    messages::{GetRoom, MessageArgs, RoomList},
    WS,
};

use super::ws::messages;

#[derive(Serialize, Debug)]
#[allow(non_snake_case)]
struct User {
    id: String,
    name: String,
    isOwner: bool,
}

#[derive(Serialize, Debug)]
struct Room {
    room_id: String,
    users: Vec<User>,
}

#[derive(Debug)]
pub struct RTC {
    rooms: Vec<Room>,
    askeds: Vec<RoomList>,
}

impl RTC {
    pub fn new() -> Self {
        Self {
            rooms: Vec::new(),
            askeds: Vec::new(),
        }
    }

    pub fn get_room(&mut self, msg: MessageArgs<GetRoom>) {
        info!("Get room: {:?}", msg);

        let room_id = msg.id.clone();
        let user_id = msg.data.userId;
        let user_name = "TODO";
        let is_public = msg.data.isPublic;

        let mut index_r = self.rooms.iter().position(|room| *room.room_id == room_id);
        if let None = index_r {
            self.rooms.push(Room {
                room_id: room_id.clone(),
                users: Vec::new(),
            });
            index_r = Some(self.rooms.len() - 1);
        }
        let index_r = index_r.unwrap();

        let index = self.rooms[index_r]
            .users
            .iter()
            .position(|user| *user.id == user_id);
        if let Some(_) = index {
            warn!("Duplicate user: {} to room: {}", user_id, room_id);
            return;
        }
        self.rooms[index_r].users.push(User {
            id: user_id.clone(),
            name: "TODO".to_string(),
            // TODO
            isOwner: true,
        });

        let mut index_a = self
            .askeds
            .iter()
            .position(|asked| *asked.room_id == room_id);
        if let None = index_a {
            self.askeds.push(RoomList {
                room_id: room_id.clone(),
                users: Vec::new(),
            });
            index_a = Some(self.rooms.len() - 1);
        }
        let index_a = index_a.unwrap();

        let index = self.askeds[index_a]
            .users
            .iter()
            .position(|user| *user == user_id);
        if let Some(_) = index {
            warn!(
                "Duplicate askeds index; room_id: {}; user_id: {}",
                room_id, user_id
            );
            return;
        }
        self.askeds[index_a].users.push(user_id);
    }
}
