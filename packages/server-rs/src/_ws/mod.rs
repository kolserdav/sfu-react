use self::messages::{Any, FromValue, GetLocale, GetUserId, SetUserId};

pub use super::locales::{get_locale, Client, LocaleValue};
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
use ws::{listen, CloseCode, Handler, Message, Result as WSResult, Sender};

struct Server {
    out: Sender,
}

impl Handler for Server {
    fn on_message(&mut self, msg: Message) -> WSResult<()> {
        println!("Server got message '{}'. ", msg);
        self.out.send(msg)
    }

    fn on_close(&mut self, code: CloseCode, reason: &str) {
        println!("WebSocket closing for ({:?}) {}", code, reason);
        println!("Shutting down server after first connection closes.");
        self.out.shutdown().unwrap();
    }
}

pub struct WS {
    pub sockets: HashMap<String, Sender>,
}

impl WS {
    pub fn new() -> Self {
        Self {
            sockets: HashMap::new(),
        }
    }

    pub fn listen_ws(
        &mut self,
        addr: &str,
        cb: fn(ws: Arc<Mutex<&mut WS>>, msg: Message, out: Sender, conn_id: Uuid) -> ws::Result<()>,
    ) {
        let this = Arc::new(Mutex::new(self));
        let self_t = this.clone();

        let res = listen(addr, |out| {
            let conn_id = Uuid::new_v4();
            let this = this.clone();
            move |msg: Message| cb(this.to_owned(), msg, out.to_owned(), conn_id)
        });
        if let Err(e) = res {
            error!("Error in ws {}", e);
            let mut self_t = self_t.lock().unwrap();
            self_t.listen_ws(addr, cb);
        }
    }

    pub fn get_locale(&mut self, msg: Message, out: Sender, conn_id: Uuid) {
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
        out.send(to_string(&mess).unwrap()).unwrap();
    }

    pub fn get_user_id(&mut self, msg: Message, out: Sender, conn_id: Uuid) {
        let msg = self.parse_message::<GetUserId>(msg).unwrap();
        let conn_id_str = conn_id.to_string();

        self.sockets.insert(conn_id.to_string(), out);

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
        let out = self.sockets.get(&msg.connId);
        if let None = out {
            return Err(());
        }
        let out = out.unwrap();
        debug!("Send message: {:?}", &msg);
        out.send(to_string(&msg).unwrap()).unwrap();
        Ok(())
    }

    pub fn parse_message<T>(&mut self, msg: Message) -> SerdeResult<MessageArgs<T>>
    where
        T: FromValue + Debug,
    {
        let msg_str = msg.as_text().unwrap();
        let json: serde_json::Value = serde_json::from_str(msg_str).map_err(|err| {
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
}
