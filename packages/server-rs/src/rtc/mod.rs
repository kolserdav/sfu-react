use std::sync::{Arc, Mutex, MutexGuard};

use serde::Serialize;
use uuid::Uuid;

use crate::ws::{
    messages::{GetRoom, MessageArgs, MessageType, RoomList, SetRoom},
    WS,
};

use super::ws::messages;

#[derive(Serialize, Debug)]
#[allow(non_snake_case)]
pub struct User {
    pub id: String,
    pub name: String,
    pub isOwner: bool,
}

#[derive(Serialize, Debug)]
pub struct Room {
    pub room_id: String,
    pub users: Vec<User>,
}

#[derive(Debug)]
pub struct RTC {
    pub rooms: Vec<Room>,
    pub askeds: Vec<RoomList>,
}

impl RTC {
    pub fn new() -> Self {
        Self {
            rooms: Vec::new(),
            askeds: Vec::new(),
        }
    }

    pub fn add_room(&mut self, room_id: String) -> Option<usize> {
        let mut index_r = self.rooms.iter().position(|room| *room.room_id == room_id);
        if let None = index_r {
            self.rooms.push(Room {
                room_id: room_id.clone(),
                users: Vec::new(),
            });
            index_r = Some(self.rooms.len() - 1);
        }
        index_r
    }

    pub fn add_user_to_room(&mut self, index_r: usize, user_id: String) {
        let index = self.rooms[index_r]
            .users
            .iter()
            .position(|user| *user.id == user_id);
        if let Some(_) = index {
            warn!("Duplicate user: {}", user_id);
            return;
        }
        self.rooms[index_r].users.push(User {
            id: user_id,
            name: "TODO".to_string(),
            // TODO
            isOwner: true,
        })
    }
}
