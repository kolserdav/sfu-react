use std::{fmt::Debug, net::TcpStream, sync::Mutex};

use serde::Serialize;
use serde_json::to_string;
use tungstenite::{Message, WebSocket};
use uuid::Uuid;

use crate::{
    common::Room,
    ws::{
        messages::{GetChatUnit, MessageArgs, MessageType, SetChatUnit},
        LocaleValue, WSCallbackSocket,
    },
};

#[derive(Debug)]
#[allow(non_snake_case)]
pub struct User {
    pub id: String,
    pub locale: LocaleValue,
    pub ws: WSCallbackSocket,
    pub connId: String,
}

#[derive(Debug)]
pub struct Chat {
    pub rooms: Mutex<Vec<Room<User>>>,
}

impl Chat {
    pub fn new() -> Self {
        Self {
            rooms: Mutex::new(Vec::new()),
        }
    }

    pub fn set_socket(
        &self,
        room_id: String,
        user_id: String,
        ws: WSCallbackSocket,
        conn_id: String,
        locale: LocaleValue,
    ) {
        let mut rooms = self.rooms.lock().unwrap();
        let mut index_r = rooms.iter().position(|room| *room.room_id == room_id);
        if let None = index_r {
            rooms.push(Room {
                room_id: room_id.clone(),
                users: Vec::new(),
            });
            index_r = Some(rooms.len() - 1);
        }
        let index_r = index_r.unwrap();

        let index_u = rooms[index_r]
            .users
            .iter()
            .position(|user| *user.id == user_id);
        if let Some(_) = index_u {
            warn!("Duplicate chat user: {} in room: {}", &user_id, &room_id);
            return;
        }

        rooms[index_r].users.push(User {
            id: user_id.clone(),
            ws,
            connId: conn_id.clone(),
            locale,
        });
        drop(rooms);

        self.send_message(MessageArgs {
            id: user_id,
            connId: conn_id,
            r#type: MessageType::SET_CHAT_UNIT,
            data: (),
        })
        .unwrap();
    }

    fn find_rooms_indexes(&self, user_id: &String) -> (Option<usize>, Option<usize>) {
        let mut i = 0;
        let mut index_r = None;
        let mut index_u = None;

        let rooms = self.rooms.lock().unwrap();
        for room in rooms.iter() {
            let index = room.users.iter().position(|u| *u.id == *user_id);
            if let Some(v) = index {
                index_r = Some(i);
                index_u = Some(v);
                break;
            }
            i += 1;
        }
        (index_r, index_u)
    }

    pub fn send_message<T>(&self, msg: MessageArgs<T>) -> Result<(), ()>
    where
        T: Serialize + Debug,
    {
        let user_id = msg.id.clone();

        let (index_r, index_u) = self.find_rooms_indexes(&user_id);
        if let None = index_r {
            warn!("Room is missing in chat send_message: {}", msg);
            return Err(());
        }
        let index_r = index_r.unwrap();
        if let None = index_u {
            warn!("User is missing in chat send_message: {}", msg);
            return Err(());
        }
        let index_u = index_u.unwrap();

        let rooms = self.rooms.lock().unwrap();
        let mut socket = rooms[index_r].users[index_u].ws.lock().unwrap();

        debug!("Send message: {:?}", &msg);
        socket
            .write_message(Message::Text(to_string(&msg).unwrap()))
            .unwrap();
        Ok(())
    }
}
