use self::messages::{
    Answer, Candidate, GetChatUnit, GetLocale, GetRoom, GetUserId, Offer, SetUserId,
};
pub use super::locales::{get_locale, Client, LocaleValue};
use crate::{
    chat::Chat,
    prelude::{get_ws_url, parse_message},
    rtc::RTC,
    ws::messages::{Any, SetRoom},
};
use futures::executor::block_on;
use futures_util::{SinkExt, StreamExt};
use tokio_tungstenite::{
    accept_hdr_async,
    tungstenite::{
        connect,
        handshake::server::{Request, Response},
        Message,
    },
    WebSocketStream,
};
use url::Url;
use uuid::Uuid;
pub mod messages;
use log::{debug, error, info};

use messages::{MessageArgs, MessageType, SetLocale};
use serde::Serialize;
use serde_json::to_string;
use std::{collections::HashMap, fmt::Debug, mem::drop, sync::Arc, thread::spawn};
use tokio::{
    net::{TcpListener, TcpStream},
    sync::Mutex,
};

pub type WSCallbackSelf<'a> = &'a WS;
pub type WSCallbackSocket = Arc<Mutex<WebSocketStream<TcpStream>>>;

#[derive(Debug)]

pub struct WS {
    pub rtc: RTC,
    pub chat: Chat,
    pub sockets: Mutex<HashMap<String, WSCallbackSocket>>,
    pub users: Mutex<HashMap<String, String>>,
    pub rooms: Mutex<HashMap<String, String>>,
}

impl WS {
    pub fn new(rtc: RTC, chat: Chat) -> Self {
        Self {
            rtc,
            chat,
            sockets: Mutex::new(HashMap::new()),
            users: Mutex::new(HashMap::new()),
            rooms: Mutex::new(HashMap::new()),
        }
    }

    async fn handler<'a>(&'static self, msg: Message, conn_id: Uuid, socket: WSCallbackSocket) {
        let msg_c = msg.clone();
        let json = parse_message::<Any>(msg);
        if let Err(e) = json {
            error!("Error handle WS: {:?}", e);
            return;
        }
        let json = json.unwrap();
        let type_mess = &json.r#type;

        debug!("Get message: {}", json);

        match type_mess {
            MessageType::GET_LOCALE => {
                let msg = parse_message::<GetLocale>(msg_c).unwrap();
                self.get_locale_handler(msg, conn_id, socket).await;
            }
            MessageType::GET_USER_ID => {
                let msg = parse_message::<GetUserId>(msg_c).unwrap();
                self.get_user_id(msg, conn_id, socket).await;
            }
            MessageType::GET_ROOM => {
                let msg = parse_message::<GetRoom>(msg_c).unwrap();
                self.get_room(msg).await;
            }
            MessageType::GET_CHAT_UNIT => {
                let msg = parse_message::<GetChatUnit>(msg_c).unwrap();
                self.get_chat_unit(msg, conn_id, socket).await;
            }
            MessageType::OFFER => {
                let msg = parse_message::<Offer>(msg_c).unwrap();
                self.offer_handler(msg).await;
            }
            MessageType::CANDIDATE => {
                let msg = parse_message::<Candidate>(msg_c).unwrap();
                self.candidate_handler(msg).await;
            }
            _ => {
                warn!("Default case of message: {:?}", json);
            }
        };
    }

    pub async fn listen_ws(&'static self, addr: &str) {
        let server = TcpListener::bind(addr).await;
        if let Err(e) = server {
            error!("Failed start WS server: {:?}", e);
            return;
        }
        let server = server.unwrap();
        info!("Server WS listen at: {}", &addr);

        let this = Arc::new(self);

        while let Ok((stream, _)) = server.accept().await {
            let this = this.clone();
            tokio::spawn(this.handle_mess(stream));
        }
    }

    async fn handle_mess(&'static self, stream: TcpStream) {
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

        let websocket = accept_hdr_async(stream, callback)
            .await
            .expect("Error during the websocket handshake occurred");

        let ws = Arc::new(Mutex::new(websocket));
        let websocket = ws.clone();
        let conn_id = Uuid::new_v4();
        debug!("New Connection: {:?}, Protocol: {}", conn_id, protocol);

        loop {
            let mut websocket = websocket.lock().await;
            let msg = websocket.next().await;
            if let None = msg {
                info!("Message is none: {}", &conn_id);
                break;
            }
            let msg = msg.unwrap();
            drop(websocket);

            let msg = msg.unwrap();
            let ws = ws.clone();
            if msg.is_text() || msg.is_binary() {
                self.handler(msg, conn_id, ws).await;
            } else if msg.is_close() {
                let sockets = self.sockets.lock().await;
                info!(
                    "Closed: {}, Protocol: {}, Sockets: {:?}",
                    conn_id,
                    protocol,
                    sockets.len()
                );
                drop(sockets);

                if protocol == "room" {
                    self.delete_socket(conn_id.to_string()).await;

                    let user_id = self.get_user_id_by_conn_id(&conn_id.to_string()).await;
                    if let None = user_id {
                        warn!("Deleted user is missing: {:?}", conn_id);
                        return;
                    }
                    let user_id = user_id.unwrap();

                    self.delete_user(&user_id).await;
                    self.rtc.delete_user_from_room(&user_id).await;
                    self.rtc.delete_askeds(&user_id).await;
                } else if protocol == "chat" {
                    self.chat.delete_chat_user(&conn_id.to_string()).await;
                }
            } else {
                warn!("Unsupported message mime: {:?}", msg);
            }
        }
    }

    pub async fn get_locale_handler(
        &self,
        msg: MessageArgs<GetLocale>,
        conn_id: Uuid,
        ws: WSCallbackSocket,
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
        let mut write = ws.lock().await;
        write
            .send(Message::Text(to_string(&mess).unwrap()))
            .await
            .unwrap();
    }

    pub async fn get_user_id(
        &self,
        msg: MessageArgs<GetUserId>,
        conn_id: Uuid,
        ws: WSCallbackSocket,
    ) {
        let conn_id_str = conn_id.to_string();

        let is_room_o = msg.data.isRoom;
        let is_room;
        if let None = is_room_o {
            is_room = false;
        } else {
            is_room = is_room_o.unwrap();
        }

        self.set_user(msg.id.clone(), conn_id.to_string(), is_room)
            .await;

        self.set_socket(conn_id.to_string(), ws).await;

        self.send_message(MessageArgs::<SetUserId> {
            id: msg.id,
            connId: conn_id_str,
            r#type: MessageType::SET_USER_ID,
            data: SetUserId {
                name: msg.data.userName,
            },
        })
        .await
        .unwrap();
    }

    pub async fn send_message<T>(&self, msg: MessageArgs<T>) -> Result<(), ()>
    where
        T: Serialize + Debug,
    {
        let conn_id = self.get_conn_id(&msg.id).await;
        if let None = conn_id {
            warn!("Conn id is missing in send_message: {}", msg);
            return Err(());
        }
        let conn_id = conn_id.unwrap();

        let sockets = self.sockets.lock().await;
        let socket = sockets.get(&conn_id);
        if let None = socket {
            warn!("Socket is missing in send_message: {}", msg);
            return Err(());
        }

        let socket = socket.unwrap();

        info!("Send message: {:?}", &msg);
        socket
            .lock()
            .await
            .send(Message::Text(to_string(&msg).unwrap()))
            .await
            .unwrap();
        Ok(())
    }

    pub async fn get_conn_id(&self, id: &String) -> Option<String> {
        let users = self.users.lock().await;
        let user = users.get(id);
        if let None = user {
            drop(users);

            let rooms = self.rooms.lock().await;
            let room = rooms.get(id);
            if let Some(v) = room {
                return Some(v.clone());
            }

            return None;
        }

        let user = user.unwrap();
        Some(user.clone())
    }

    async fn set_user(&self, id: String, conn_id: String, is_room: bool) {
        if is_room {
            let mut rooms = self.rooms.lock().await;
            let user = rooms.get(&id);
            if let Some(u) = user {
                warn!("Duplicate WS room: {}", u);
                return;
            }
            rooms.insert(id, conn_id.clone());
            return;
        }

        let mut users = self.users.lock().await;
        let user = users.get(&id);
        if let Some(u) = user {
            warn!("Duplicate WS user: {}", u);
            return;
        }
        users.insert(id, conn_id.clone());
    }

    async fn set_socket(&self, conn_id: String, ws: WSCallbackSocket) {
        let mut sockets = self.sockets.lock().await;
        let socket = sockets.get(&conn_id);
        if let Some(_) = socket {
            warn!("Duplicate socket: {}", conn_id);
            return;
        }
        sockets.insert(conn_id, ws);
    }

    async fn delete_socket(&self, conn_id: String) {
        let mut sockets = self.sockets.lock().await;
        let socket = sockets.get(&conn_id);
        if let None = socket {
            warn!("Deleted socket is missing: {}", conn_id);
            return;
        }
        sockets.remove(&conn_id);
        info!("Socket deleted: {:?}", conn_id);
    }

    async fn get_user_id_by_conn_id(&self, conn_id: &String) -> Option<String> {
        let users = self.users.lock().await;
        let mut user_id = None;
        for (key, val) in users.iter() {
            if *val == *conn_id {
                user_id = Some(key.clone());
            }
        }
        user_id
    }

    async fn delete_user(&self, user_id: &String) {
        let mut users = self.users.lock().await;
        users.remove(user_id);
        info!("User deleted: {:?}", user_id);
    }

    pub async fn get_room(&self, msg: MessageArgs<GetRoom>) {
        info!("Get room: {:?}", msg);

        let room_id = msg.id.clone();
        let user_id = msg.data.userId;
        // let user_name = "TODO";
        // let is_public = msg.data.isPublic;

        let conn_id = self.get_conn_id(&user_id).await;
        if let None = conn_id {
            warn!("Conn id is missing in get_room: {}:{}", &room_id, &user_id);
            return;
        }

        self.rtc
            .add_user_to_room(room_id.clone(), user_id.clone())
            .await;

        let asked = self
            .rtc
            .add_user_to_askeds(room_id.clone(), user_id.clone())
            .await;

        self.send_message(MessageArgs::<SetRoom> {
            id: user_id,
            connId: msg.connId,
            r#type: MessageType::SET_ROOM,
            //  TODO
            data: SetRoom {
                isOwner: true,
                asked,
            },
        })
        .await
        .unwrap();

        self.handle_room(
            get_ws_url(),
            MessageArgs {
                id: room_id.clone(),
                connId: String::from(""),
                r#type: MessageType::GET_USER_ID,
                data: GetUserId {
                    isRoom: Some(true),
                    locale: LocaleValue::en,
                    userName: String::from("room"),
                },
            },
        )
        .await;
    }

    pub async fn get_chat_unit(
        &self,
        msg: MessageArgs<GetChatUnit>,
        conn_id: Uuid,
        ws: WSCallbackSocket,
    ) {
        let room_id = msg.id.clone();

        let locale = msg.data.locale.clone();
        let user_id = msg.data.userId.clone();

        info!("Get chat unit: {}", msg);
        self.chat
            .set_socket(room_id, user_id, ws, conn_id.to_string(), locale)
            .await;
    }

    pub async fn offer_handler(&'static self, msg: MessageArgs<Offer>) {
        let msg_c = msg.clone();
        let sdp = self
            .rtc
            .offer(msg, move |msg| {
                block_on(self.send_message(msg)).unwrap();
            })
            .await;
        if let None = sdp {
            warn!("Skip send answer message: {}", &msg_c);
            return;
        }
        let msg = msg_c;
        let sdp = sdp.unwrap();
        self.send_message(MessageArgs {
            id: msg.data.userId.clone(),
            connId: msg.connId,
            r#type: MessageType::ANSWER,
            data: Answer {
                sdp,
                userId: msg.id,
                target: msg.data.target,
            },
        })
        .await
        .unwrap();
    }

    pub async fn candidate_handler(&self, msg: MessageArgs<Candidate>) {
        self.rtc.candidate(msg).await;
    }

    pub async fn handle_room(&self, _url: Url, mess: MessageArgs<GetUserId>) {
        spawn(move || {
            let (mut socket, _) = connect(_url).expect("Can't connect");

            socket
                .write_message(Message::Text(to_string(&mess).unwrap()))
                .unwrap();

            loop {
                // TODO clean
                let msg = socket.read_message().expect("Error reading room message");
                let msg = parse_message::<Any>(msg).unwrap();
                error!("Received: {}", msg);
            }
        });
    }
}
