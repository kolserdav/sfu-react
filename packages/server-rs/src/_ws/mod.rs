use self::messages::{Any, FromValue, GetLocale, GetUserId, SetUserId};
pub use super::locales::{get_locale, Client, LocaleValue};
use std::{
    net::{TcpListener, TcpStream},
    ops::Deref,
    thread::spawn,
};
use tungstenite::{
    accept_hdr,
    handshake::server::{Request, Response},
    Message, WebSocket,
};
use uuid::Uuid;
pub mod messages;

use messages::{MessageArgs, MessageType, SetLocale};
use serde::Serialize;
use serde_json::{to_string, Result as SerdeResult};
use std::{
    collections::HashMap,
    fmt::Debug,
    str::FromStr,
    sync::{Arc, Mutex},
};
mod collections;
use collections::Sockets;

#[derive(Debug)]
pub struct Socket<'a> {
    pub conn_id: String,
    pub ws: &'a mut WebSocket<TcpStream>,
}

#[derive(Debug)]

pub struct WS<'a> {
    pub sockets: Vec<Socket<'a>>,
}

impl WS<'static> {
    pub fn new() -> Self {
        Self {
            sockets: Vec::new(),
        }
    }

    pub fn listen_ws(self, addr: &str) {
        let server = TcpListener::bind("127.0.0.1:3012").unwrap();
        for stream in server.incoming() {
            spawn(move || {
                let callback = |req: &Request, mut response: Response| {
                    debug!("Received a new ws handshake");
                    debug!("The request's path is: {}", req.uri().path());
                    debug!("The request's headers are:");
                    for (ref header, _value) in req.headers() {
                        debug!("* {}: {:?}", header, _value);
                    }

                    let headers = response.headers_mut();
                    headers.append("MyCustomHeader", ":)".parse().unwrap());

                    Ok(response)
                };
                let websocket = accept_hdr(stream.unwrap(), callback).unwrap();
                loop {
                    let msg = websocket.read_message().unwrap();
                    if msg.is_binary() || msg.is_text() {
                        let conn_id = Uuid::new_v4();
                        self.handle_ws(msg, conn_id, websocket);
                    }
                }
            });
        }
    }

    fn handle_ws(self, msg: Message, conn_id: Uuid, ws: WebSocket<TcpStream>) -> Result<(), ()> {
        let msg_c = msg.clone();
        let json = self.parse_message::<Any>(msg);
        if let Err(e) = json {
            return Ok(());
        }
        let json = json.unwrap();
        let type_mess = &json.r#type;

        match type_mess {
            MessageType::GET_LOCALE => {
                self.get_locale(msg_c, ws, conn_id);
            }
            MessageType::GET_USER_ID => {
                self.get_user_id(msg_c, ws, conn_id);
            }
            _ => {
                warn!("Default case of message: {:?}", json);
            }
        };

        Ok(())
    }

    pub fn get_locale(&mut self, msg: Message, ws: WebSocket<TcpStream>, conn_id: Uuid) {
        let msg = self.parse_message::<GetLocale>(msg).unwrap();
        let locale = get_locale(msg.data.locale);
        let mess = MessageArgs {
            connId: conn_id.to_string(),
            id: msg.id,
            data: SetLocale {
                locale: locale.Client,
            },
            r#type: MessageType::SET_LOCALE,
        };
        let mut ws = ws;
        ws.write_message(Message::Text(to_string(&mess).unwrap()))
            .unwrap();
    }

    pub fn get_user_id(&mut self, msg: Message, ws: WebSocket<TcpStream>, conn_id: Uuid) {
        let msg = self.parse_message::<GetUserId>(msg).unwrap();
        let conn_id_str = conn_id.to_string();

        // self.sockets.insert(conn_id.to_string(), out);

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

    fn send_message<T>(&mut self, msg: MessageArgs<T>) -> Result<(), ()>
    where
        T: Serialize + Debug,
    {
        let out = self.get_socket_by_id(&msg.connId);
        if let None = out {
            return Err(());
        }
        let mut out = out.unwrap();
        debug!("Send message: {:?}", &msg);
        out.write_message(Message::Text(to_string(&msg).unwrap()))
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

    pub fn get_socket_by_id(&mut self, conn_id: &String) -> Option<&mut WebSocket<TcpStream>> {
        let mut res: Option<&mut WebSocket<TcpStream>> = None;
        for sock in &mut self.sockets {
            if sock.conn_id == conn_id.deref() {
                res = Some(sock.ws);
                break;
            }
        }
        res
    }
}
