#[macro_use]
extern crate log;
pub mod ws;
use std::{
    net::TcpStream,
    sync::{Arc, Mutex},
};
use uuid::Uuid;
use ws::{
    messages::{Any, MessageType},
    WS,
};
mod locales;
pub mod thread_pool;
use tungstenite::{Message, WebSocket};
mod rtc;
use rtc::RTC;

use crate::ws::messages::{GetLocale, GetRoom, GetUserId};

fn main() {
    env_logger::builder().format_timestamp(None).init();

    let _rtc = RTC::new();

    let ws = WS::new(_rtc);

    let cl = |ws: Arc<Mutex<WS>>,
              msg: Message,
              conn_id: Uuid,
              socket: Arc<Mutex<WebSocket<TcpStream>>>|
     -> Result<(), ()> {
        let ws_c = ws.clone();
        let mut ws = ws.lock().unwrap();
        let msg_c = msg.clone();
        let json = ws.parse_message::<Any>(msg);
        if let Err(e) = json {
            error!("Error handle WS: {:?}", e);
            return Ok(());
        }
        let json = json.unwrap();
        let type_mess = &json.r#type;

        debug!("Get message: {}", json);

        match type_mess {
            MessageType::GET_LOCALE => {
                let msg = ws.parse_message::<GetLocale>(msg_c).unwrap();
                ws.get_locale(msg, conn_id, socket);
            }
            MessageType::GET_USER_ID => {
                let msg = ws.parse_message::<GetUserId>(msg_c).unwrap();
                ws.get_user_id(msg, conn_id, socket);
            }
            MessageType::GET_ROOM => {
                let msg = ws.parse_message::<GetRoom>(msg_c).unwrap();
                ws.rtc.get_room(msg, ws_c);
            }
            _ => {
                warn!("Default case of message: {:?}", json);
            }
        };

        Ok(())
    };

    ws.listen_ws("127.0.0.1:3001", cl);
}
