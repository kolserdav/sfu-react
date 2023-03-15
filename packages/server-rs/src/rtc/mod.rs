use std::sync::Mutex;

use serde::Serialize;

use crate::ws::messages::RoomList;

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
    pub rooms: Mutex<Vec<Room>>,
    pub askeds: Mutex<Vec<RoomList>>,
}

impl RTC {
    pub fn new() -> Self {
        Self {
            rooms: Mutex::new(Vec::new()),
            askeds: Mutex::new(Vec::new()),
        }
    }

    pub fn add_room(&self, room_id: String) -> Option<usize> {
        let mut rooms = self.rooms.lock().unwrap();
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

    pub fn add_user_to_room(&self, room_id: String, user_id: String) {
        let index_r = self.add_room(room_id).unwrap();
        let mut rooms = self.rooms.lock().unwrap();
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

    pub fn delete_user_from_room(&self, user_id: String) {
        let mut i = 0;
        let mut index_r = None;
        let mut index_u = None;
        let mut rooms = self.rooms.lock().unwrap();
        for room in rooms.iter() {
            let index = room.users.iter().position(|u| *u.id == user_id);
            if let Some(v) = index {
                index_r = Some(i);
                index_u = Some(v);
                break;
            }
            i += 1;
        }
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

    fn create_askeds(&self, room_id: String) -> Option<usize> {
        let mut askeds = self.askeds.lock().unwrap();
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

    pub fn add_user_to_askeds(&self, room_id: String, user_id: String) -> Vec<String> {
        let index_a = self.create_askeds(room_id).unwrap();
        let mut askeds = self.askeds.lock().unwrap();
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
}
