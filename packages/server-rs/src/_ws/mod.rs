use super::locales::{get_locale, Client, LocaleValue};

pub type LocaleClient<'a> = Client<'a>;

mod messages;
use messages::{LocaleMsg, MessageArgs, MessageType};
use serde_json::{to_string, Result as SerdeResult, Value};
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
        let res = listen(addr, |out| move |msg: Message| self.handle_ws(msg, &out));
        if let Err(e) = res {
            error!("Error in ws {}", e);
            self.listen_ws(addr);
        }
    }

    fn handle_ws(self, msg: Message, out: &Sender) -> ws::Result<()> {
        let json = self.parse_message(msg).unwrap();
        let type_mess = &json["type"].as_str();
        if let None = type_mess {
            return Ok(());
        }
        let type_mess = MessageType::from_str(type_mess.unwrap()).unwrap();

        match type_mess {
            MessageType::GET_LOCALE => {
                let locale = get_locale(
                    LocaleValue::from_str(json["data"]["locale"].as_str().unwrap()).unwrap(),
                );
                let locale = LocaleMsg {
                    locale: locale.Client,
                };
                let mess = MessageArgs::<LocaleMsg> {
                    connId: json["connId"].to_string(),
                    id: json["id"].to_string(),
                    data: locale,
                    r#type: MessageType::SET_LOCALE,
                };
                out.send(to_string(&mess).unwrap()).unwrap();
            }
            _ => {
                warn!("Default case of message: {}", json);
            }
        };

        Ok(())
    }

    fn parse_message(self, msg: Message) -> SerdeResult<Value> {
        let msg_str = msg.as_text().unwrap();
        let json: serde_json::Value = serde_json::from_str(msg_str).map_err(|err| {
            error!("Failed parse JSON: {:?}", err);
            err
        })?;
        Ok(json)
    }
}
