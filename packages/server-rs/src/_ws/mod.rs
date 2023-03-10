use self::messages::{Any, FromValue, GetLocale, GetUserId};

pub use super::locales::{get_locale, Client, LocaleValue};
use uuid::Uuid;
mod messages;
use messages::{MessageArgs, MessageType, SetLocale};
use serde::Serialize;
use serde_json::{to_string, Result as SerdeResult};
use std::{
    collections::HashMap,
    str::FromStr,
    sync::{Arc, Mutex},
};
use ws::{listen, Message, Sender};

pub struct WS {
    pub sockets: HashMap<String, Sender>,
}

impl WS {
    pub fn new() -> Self {
        Self {
            sockets: HashMap::new(),
        }
    }

    pub fn listen_ws(&mut self, addr: &str) {
        let this = Arc::new(Mutex::new(self));
        let self_t = this.clone();
        let res = listen(addr, |out| {
            let conn_id = Uuid::new_v4();
            let this = this.clone();
            move |msg: Message| {
                let mut this = this.lock().unwrap();
                this.handle_ws(msg, out, conn_id)
            }
        });
        if let Err(e) = res {
            error!("Error in ws {}", e);
            let mut self_t = self_t.lock().unwrap();
            self_t.listen_ws(addr);
        }
    }

    fn handle_ws(&mut self, msg: Message, out: Sender, conn_id: Uuid) -> ws::Result<()> {
        let msg_c = msg.clone();
        let json = self.parse_message::<Any>(msg);
        if let Err(e) = json {
            return Ok(());
        }
        let json = json.unwrap();
        let type_mess = &json.r#type;

        match type_mess {
            MessageType::GET_LOCALE => {
                self.get_locale(msg_c, out, conn_id);
            }
            MessageType::GET_USER_ID => {
                self.get_user_id(msg_c, out, conn_id);
            }
            _ => {
                warn!("Default case of message: {:?}", json);
            }
        };

        Ok(())
    }

    fn get_locale(&mut self, msg: Message, out: Sender, conn_id: Uuid) {
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

    fn get_user_id(&mut self, msg: Message, out: Sender, conn_id: Uuid) {
        let msg = self.parse_message::<GetUserId>(msg).unwrap();
        self.sockets.insert(conn_id.to_string(), out);
        // out.send(to_string(&mess).unwrap()).unwrap();
    }

    fn send_message<T>(&mut self, conn_id: String, msg: MessageArgs<T>) -> Result<(), ()>
    where
        T: Serialize,
    {
        let out = self.sockets.get(&conn_id);
        if let None = out {
            return Err(());
        }
        let out = out.unwrap();
        out.send(to_string(&msg).unwrap());
        Ok(())
    }

    fn parse_message<T>(&mut self, msg: Message) -> SerdeResult<MessageArgs<T>>
    where
        T: FromValue,
    {
        let msg_str = msg.as_text().unwrap();
        let json: serde_json::Value = serde_json::from_str(msg_str).map_err(|err| {
            error!("Failed parse JSON: {:?}", err);
            err
        })?;
        Ok(MessageArgs {
            id: json["id"].to_string(),
            connId: json["connId"].to_string(),
            r#type: MessageType::from_str(json["type"].as_str().unwrap()).unwrap(),
            data: T::from(&json["data"]),
        })
    }
}
