use self::messages::{Any, FromValue, GetLocale};

pub use super::locales::{get_locale, Client, LocaleValue};
use uuid::Uuid;
mod messages;
use messages::{MessageArgs, MessageType, SetLocale};
use serde_json::{to_string, Result as SerdeResult};
use std::{collections::HashMap, str::FromStr};
use ws::{listen, Message, Sender};

#[derive(Clone, Copy)]
pub struct WS<'a> {
    pub sockets: &'a HashMap<&'a str, Sender>,
}

pub struct Static<'a> {
    pub sockets: HashMap<&'a str, Sender>,
}

impl<'a> WS<'a> {
    pub fn new(glob: &'a Static<'a>) -> Self {
        Self {
            sockets: &glob.sockets,
        }
    }

    pub fn listen_ws(self, addr: &str) {
        let res = listen(addr, |out| {
            let conn_id = Uuid::new_v4();
            move |msg: Message| self.handle_ws(msg, &out, conn_id)
        });
        if let Err(e) = res {
            error!("Error in ws {}", e);
            self.listen_ws(addr);
        }
    }

    fn handle_ws(self, msg: Message, out: &Sender, conn_id: Uuid) -> ws::Result<()> {
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
            MessageType::GET_USER_ID => {}
            _ => {
                warn!("Default case of message: {:?}", json);
            }
        };

        Ok(())
    }

    fn get_locale(self, msg: Message, out: &Sender, conn_id: Uuid) {
        let json = self.parse_message::<GetLocale>(msg).unwrap();
        let locale = get_locale(json.data.locale);
        let locale = SetLocale {
            locale: locale.Client,
        };
        let mess = MessageArgs {
            connId: conn_id.to_string(),
            id: json.id,
            data: locale,
            r#type: MessageType::SET_LOCALE,
        };
        out.send(to_string(&mess).unwrap()).unwrap();
    }

    fn parse_message<T>(self, msg: Message) -> SerdeResult<MessageArgs<T>>
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
