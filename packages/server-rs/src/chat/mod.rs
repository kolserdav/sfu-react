use std::fmt::Debug;

use tokio::sync::Mutex;

use futures_util::SinkExt;
use serde::Serialize;
use serde_json::to_string;
use tokio_tungstenite::tungstenite::Message;

use crate::{
    common::{Room, RoomsMutex},
    prelude::get_websocket,
    ws::{
        messages::{MessageArgs, MessageType},
        LocaleValue, WSCallbackSocket,
    },
};

#[derive(Debug)]
#[allow(non_snake_case)]
pub struct User {
    pub id: String,
    pub locale: LocaleValue,
    pub conn_id: String,
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

    pub async fn set_socket(
        &self,
        room_id: String,
        user_id: String,
        conn_id: String,
        locale: LocaleValue,
    ) {
        let mut rooms = self.rooms.lock().await;
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
            conn_id: conn_id.clone(),
            locale,
        });
        drop(rooms);

        self.send_message(MessageArgs {
            id: user_id,
            connId: conn_id,
            r#type: MessageType::SET_CHAT_UNIT,
            data: (),
        })
        .await
        .unwrap();
    }

    pub async fn delete_chat_user(&self, conn_id: &String) {
        debug!("Try delete chat user: {}", conn_id);
        let (index_r, index_u, mut rooms) = self.find_rooms_indexes_by_conn_id(conn_id).await;
        if let None = index_r {
            warn!("Room is missing in delete_chat_user: {}", conn_id);
            return;
        }
        let index_r = index_r.unwrap();
        if let None = index_u {
            warn!("User is missing in delete_chat_user: {}", conn_id);
            return;
        }
        let index_u = index_u.unwrap();

        rooms[index_r].users.remove(index_u);

        debug!("Chat user deleted: {}", conn_id);
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

    async fn find_rooms_indexes_by_conn_id(
        &self,
        conn_id: &String,
    ) -> (Option<usize>, Option<usize>, RoomsMutex<User>) {
        let mut i = 0;
        let mut index_r = None;
        let mut index_u = None;

        let rooms = self.rooms.lock().await;
        for room in rooms.iter() {
            let index = room.users.iter().position(|u| *u.conn_id == *conn_id);
            if let Some(v) = index {
                index_r = Some(i);
                index_u = Some(v);
                break;
            }
            i += 1;
        }
        (index_r, index_u, rooms)
    }

    pub async fn send_message<T>(&self, msg: MessageArgs<T>) -> Result<(), ()>
    where
        T: Serialize + Debug,
    {
        let user_id = msg.id.clone();

        let (index_r, index_u, rooms) = self.find_rooms_indexes(&user_id).await;
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

        let ws = get_websocket(&rooms[index_r].users[index_u].conn_id).unwrap();
        debug!("Send message: {:?}", &msg);
        ws.send(Message::Text(to_string(&msg).unwrap()))
            .await
            .unwrap();
        Ok(())
    }
}
