use crate::{chat::Chat, rtc::RTC, ws::messages::SetRoom};

use self::messages::{FromValue, GetChatUnit, GetLocale, GetRoom, GetUserId, Offer, SetUserId};
pub use super::locales::{get_locale, Client, LocaleValue};
use futures_util::{SinkExt, StreamExt};
use tokio_tungstenite::{
    accept_hdr_async,
    tungstenite::{
        handshake::server::{Request, Response},
        Message,
    },
    WebSocketStream,
};
use uuid::Uuid;
pub mod messages;
use log::{debug, error, info};

use futures::Future;
use messages::{MessageArgs, MessageType, SetLocale};
use serde::Serialize;
use serde_json::{to_string, Result as SerdeResult};
use std::{collections::HashMap, fmt::Debug, marker::Send, mem::drop, str::FromStr, sync::Arc};
use tokio::{
    net::{TcpListener, TcpStream},
    sync::Mutex,
};

pub type WSCallbackSelf<'a> = &'a WS;
pub type WSCallbackSocket = Arc<Mutex<WebSocketStream<TcpStream>>>;
pub type CallbackListener<F>
where
    F: Future<Output = ()> + Send + 'static,
= fn(WSCallbackSelf, Message, Uuid, WSCallbackSocket) -> F;

#[derive(Debug)]

pub struct WS {
    pub rtc: Arc<RTC>,
    pub chat: Arc<Chat>,
    pub sockets: Mutex<HashMap<String, WSCallbackSocket>>,
    pub users: Mutex<HashMap<String, String>>,
}

impl WS {
    pub fn new(rtc: Arc<RTC>, chat: Arc<Chat>) -> Self {
        Self {
            rtc,
            chat,
            sockets: Mutex::new(HashMap::new()),
            users: Mutex::new(HashMap::new()),
        }
    }

    pub async fn listen_ws<F>(&'static self, addr: &str, cb: CallbackListener<F>)
    where
        F: Future<Output = ()> + Send + 'static,
    {
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
            tokio::spawn(this.handle_mess(stream, cb));
        }
    }

    async fn handle_mess<F>(&self, stream: TcpStream, cb: CallbackListener<F>)
    where
        F: Future<Output = ()> + Send + 'static,
    {
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

        let mut websocket = websocket.lock().await;

        while let Some(msg) = websocket.next().await {
            let msg = msg.unwrap();
            let ws = ws.clone();
            if msg.is_text() || msg.is_binary() {
                cb(self, msg, conn_id, ws).await;
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
                    self.delete_socket(conn_id.to_string());

                    let user_id = self.get_user_id_by_conn_id(&conn_id.to_string()).await;
                    if let None = user_id {
                        warn!("Deleted user is missing: {:?}", conn_id);
                        return;
                    }
                    let user_id = user_id.unwrap();

                    self.delete_user(&user_id);
                    self.rtc.delete_user_from_room(&user_id);
                    self.rtc.delete_askeds(&user_id);
                } else if protocol == "chat" {
                    self.chat.delete_chat_user(&conn_id.to_string());
                }
            } else {
                warn!("Unsupported message mime: {:?}", msg);
            }
        }
    }

    pub async fn get_locale(
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
        write.send(Message::Text(to_string(&mess).unwrap()));
    }

    pub async fn get_user_id(
        &self,
        msg: MessageArgs<GetUserId>,
        conn_id: Uuid,
        ws: WSCallbackSocket,
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
        .await;
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

        debug!("Send message: {:?}", &msg);
        socket
            .lock()
            .await
            .send(Message::Text(to_string(&msg).unwrap()));
        Ok(())
    }

    pub fn parse_message<T>(&self, msg: Message) -> SerdeResult<MessageArgs<T>>
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

    pub async fn get_conn_id(&self, id: &String) -> Option<String> {
        let users = self.users.lock().await;
        let user = users.get(id);
        return Some(user.unwrap().clone());
    }

    async fn set_socket(&self, id: String, conn_id: String, ws: WSCallbackSocket) {
        let mut users = self.users.lock().await;
        let user = users.get(&id);
        if let Some(u) = user {
            warn!("Duplicate WS user: {}", u);
            return;
        }
        users.insert(id, conn_id.clone());
        drop(users);

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
        let user_name = "TODO";
        let is_public = msg.data.isPublic;

        let conn_id = self.get_conn_id(&user_id).await;
        if let None = conn_id {
            warn!("Conn id is missing in get_room: {}:{}", &room_id, &user_id);
            return;
        }

        self.rtc.add_user_to_room(room_id.clone(), user_id.clone());

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
    }

    pub fn get_chat_unit(
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
            .set_socket(room_id, user_id, ws, conn_id.to_string(), locale);
    }

    pub async fn offer(&self, msg: MessageArgs<Offer>) {
        self.rtc.offer(msg).await;
    }
}
