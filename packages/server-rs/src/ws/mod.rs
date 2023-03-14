use crate::{
    rtc::RTC,
    ws::messages::{RoomList, SetRoom},
};

use self::messages::{FromValue, GetLocale, GetRoom, GetUserId, SetUserId};
pub use super::locales::{get_locale, Client, LocaleValue};
use std::{
    collections::HashMap,
    net::{TcpListener, TcpStream},
    thread::spawn,
};
use tungstenite::{
    accept_hdr,
    handshake::server::{Request, Response},
    Error, Message, WebSocket,
};
use uuid::Uuid;
pub mod messages;
use log::{debug, error, info};

use messages::{MessageArgs, MessageType, SetLocale};
use serde::Serialize;
use serde_json::{to_string, Result as SerdeResult};
use std::{
    fmt::Debug,
    str::FromStr,
    sync::{Arc, Mutex},
};

#[derive(Debug)]
pub struct Socket {
    pub conn_id: String,
    pub ws: Arc<Mutex<WebSocket<TcpStream>>>,
}

#[derive(Debug)]

pub struct WS {
    pub rtc: RTC,
    pub sockets: HashMap<String, Arc<Mutex<WebSocket<TcpStream>>>>,
    pub users: HashMap<String, String>,
}

impl WS {
    pub fn new(rtc: RTC) -> Self {
        Self {
            rtc,
            sockets: HashMap::new(),
            users: HashMap::new(),
        }
    }

    pub fn listen_ws(
        self,
        addr: &str,
        cb: fn(
            ws: Arc<Mutex<WS>>,
            msg: Message,
            conn_id: Uuid,
            ws: Arc<Mutex<WebSocket<TcpStream>>>,
        ) -> Result<(), ()>,
    ) {
        let server = TcpListener::bind(addr);
        if let Err(e) = server {
            error!("Failed start WS server: {:?}", e);
            return;
        }
        let server = server.unwrap();
        info!("Server WS listen at: {}", &addr);

        let this: Arc<Mutex<WS>> = Arc::new(Mutex::new(self));

        for stream in server.incoming() {
            let this = this.clone();

            spawn(move || {
                let mut protocol = "main".to_string();
                let callback = |req: &Request, mut response: Response| {
                    debug!("Received a new ws handshake");
                    debug!("The request's path is: {}", req.uri().path());
                    debug!("The request's headers are:");
                    for (ref header, _value) in req.headers() {
                        debug!("* {}: {:?}", header, _value);
                        if *header == "sec-websocket-protocol" {
                            protocol = _value.to_str().unwrap().to_string();
                        }
                    }

                    let headers = response.headers_mut();
                    headers.append("MyCustomHeader", ":)".parse().unwrap());

                    Ok(response)
                };

                let websocket = accept_hdr(stream.unwrap(), callback).unwrap();
                let ws = Arc::new(Mutex::new(websocket));
                let websocket = ws.clone();
                let conn_id = Uuid::new_v4();
                debug!("New Connection: {:?}, Protocol: {}", conn_id, protocol);
                loop {
                    let ws = ws.clone();
                    let mut websocket = websocket.lock().unwrap();
                    let msg = websocket.read_message();
                    if let Err(err) = msg {
                        match err {
                            Error::ConnectionClosed => {}
                            _ => {
                                error!("Error read message: {:?}", err);
                            }
                        }
                        return;
                    }
                    let msg = msg.unwrap();
                    std::mem::drop(websocket);

                    if msg.is_binary() || msg.is_text() {
                        cb(this.to_owned(), msg, conn_id, ws).unwrap();
                    } else if msg.is_close() {
                        let mut this = this.lock().unwrap();
                        info!(
                            "Closed: {}, Protocol: {}, Sockets: {:?}",
                            conn_id,
                            protocol,
                            this.sockets.len()
                        );
                        if protocol == "room" {
                            this.delete_socket(conn_id.to_string());
                            this.delete_user(conn_id.to_string());
                        }
                    } else {
                        warn!("Unsupported message mime: {:?}", msg);
                    }
                }
            });
        }
    }

    pub fn get_locale(
        &mut self,
        msg: MessageArgs<GetLocale>,
        conn_id: Uuid,
        ws: Arc<Mutex<WebSocket<TcpStream>>>,
    ) {
        let locale = get_locale(msg.data.locale);

        let mess = MessageArgs {
            connId: conn_id.to_string(),
            id: msg.id,
            data: SetLocale {
                locale: locale.Client,
            },
            r#type: MessageType::SET_LOCALE,
        };
        let mut ws = ws.lock().unwrap();
        ws.write_message(Message::Text(to_string(&mess).unwrap()))
            .unwrap();
    }

    pub fn get_user_id(
        &mut self,
        msg: MessageArgs<GetUserId>,
        conn_id: Uuid,
        ws: Arc<Mutex<WebSocket<TcpStream>>>,
    ) {
        let conn_id_str = conn_id.to_string();

        self.set_socket(msg.id.clone(), conn_id.to_string(), ws);

        self.send_message(MessageArgs::<SetUserId> {
            id: msg.id,
            connId: conn_id_str,
            r#type: MessageType::SET_USER_ID,
            data: SetUserId {
                name: msg.data.userName,
            },
        })
        .unwrap();
    }

    pub fn send_message<T>(&mut self, msg: MessageArgs<T>) -> Result<(), ()>
    where
        T: Serialize + Debug,
    {
        let conn_id = self.get_conn_id(&msg.id);
        if let None = conn_id {
            warn!("Conn id is missing in send_message: {}", msg);
            return Err(());
        }
        let conn_id = conn_id.unwrap();
        let socket = self.sockets.get(&conn_id);
        if let None = socket {
            warn!("Socket is missing in send_message: {}", msg);
            return Err(());
        }
        let socket = socket.unwrap();

        let mut socket = socket.lock().unwrap();
        debug!("Send message: {:?}", &msg);
        socket
            .write_message(Message::Text(to_string(&msg).unwrap()))
            .unwrap();
        Ok(())
    }

    pub fn parse_message<T>(&mut self, msg: Message) -> SerdeResult<MessageArgs<T>>
    where
        T: FromValue + Debug,
    {
        let msg_str = msg.to_string();
        let json: serde_json::Value = serde_json::from_str(msg_str.as_str()).map_err(|err| {
            error!("Failed parse JSON: {:?}", err);
            err
        })?;
        debug!("Parse message: {}", json);
        Ok(MessageArgs {
            id: json["id"].to_string().replace("\"", ""),
            connId: json["connId"].to_string().replace("\"", ""),
            r#type: MessageType::from_str(json["type"].as_str().unwrap()).unwrap(),
            data: T::from(&json["data"]),
        })
    }

    pub fn get_conn_id(&mut self, id: &String) -> Option<String> {
        let user = self.users.get(id);
        return Some(user.unwrap().clone());
    }

    fn set_socket(&mut self, id: String, conn_id: String, ws: Arc<Mutex<WebSocket<TcpStream>>>) {
        let user = self.users.get(&id);
        if let Some(u) = user {
            warn!("Duplicate WS user: {}", u);
            return;
        }
        self.users.insert(id, conn_id.clone());

        let socket = self.sockets.get(&conn_id);
        if let Some(_) = socket {
            warn!("Duplicate socket: {}", conn_id);
            return;
        }
        self.sockets.insert(conn_id, ws);
    }

    fn delete_socket(&mut self, conn_id: String) {
        let socket = self.sockets.get(&conn_id);
        if let None = socket {
            warn!("Deleted socket is missing: {}", conn_id);
            return;
        }
        self.sockets.remove(&conn_id);
        info!("Socket deleted: {:?}", conn_id);
    }

    fn get_user_id_by_conn_id(&mut self, conn_id: &String) -> Option<String> {
        let mut user_id = None;
        for (key, val) in self.users.iter() {
            if *val == *conn_id {
                user_id = Some(key.clone());
            }
        }
        user_id
    }

    fn delete_user(&mut self, conn_id: String) {
        let user_id = self.get_user_id_by_conn_id(&conn_id);
        if let None = user_id {
            warn!("Deleted user is missing: {:?}", conn_id);
            return;
        }
        let user_id = user_id.unwrap();
        self.users.remove(&user_id);
        info!("User deleted: {:?}", conn_id);
    }

    pub fn get_room(&mut self, msg: MessageArgs<GetRoom>) {
        info!("Get room: {:?}", msg);

        let room_id = msg.id.clone();
        let user_id = msg.data.userId;
        let user_name = "TODO";
        let is_public = msg.data.isPublic;

        let index_r = self.rtc.add_room(room_id.clone()).unwrap();

        self.rtc.add_user_to_room(index_r, user_id.clone());

        let mut index_a = self
            .rtc
            .askeds
            .iter()
            .position(|asked| *asked.room_id == room_id);
        if let None = index_a {
            self.rtc.askeds.push(RoomList {
                room_id: room_id.clone(),
                users: Vec::new(),
            });
            index_a = Some(self.rtc.rooms.len() - 1);
        }
        let index_a = index_a.unwrap();

        let index = self.rtc.askeds[index_a]
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
        self.rtc.askeds[index_a].users.push(user_id.clone());

        self.send_message(MessageArgs::<SetRoom> {
            id: user_id,
            connId: msg.connId,
            r#type: MessageType::SET_ROOM,
            //  TODO
            data: SetRoom {
                isOwner: true,
                asked: self.rtc.askeds[index_a].users.to_vec(),
            },
        })
        .unwrap();
    }
}
