use serde_json::{Result, Value};
use std::collections::HashMap;
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
        let res = listen(addr, |out| move |msg: Message| self.handle_ws(msg));
        if let Err(e) = res {
            error!("Error in ws {}", e);
            self.listen_ws(addr);
        }
    }

    fn handle_ws(self, msg: Message) -> ws::Result<()> {
        let json = self.parse_message(msg).unwrap();
        println!("type = {:?}", json["type"]);
        Ok(())
    }

    fn parse_message(self, msg: Message) -> Result<Value> {
        let msg_str = msg.as_text().unwrap();
        let json: serde_json::Value = serde_json::from_str(msg_str).map_err(|err| {
            error!("Failed parse JSON: {:?}", err);
            err
        })?;
        Ok(json)
    }
}
