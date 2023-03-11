#[macro_use]
extern crate log;
mod _ws;
use _ws::{
    messages::{Any, MessageType},
    WS,
};
use std::sync::{Arc, Mutex};
use uuid::Uuid;
use ws::{Message, Sender};
mod locales;
pub mod thread_pool;

fn main() {
    env_logger::builder().format_timestamp(None).init();

    let mut ws = WS::new();

    ws.listen_ws("127.0.0.1:3001", handle_ws);
}

fn handle_ws(ws: Arc<Mutex<&mut WS>>, msg: Message, out: Sender, conn_id: Uuid) -> ws::Result<()> {
    let mut ws = ws.lock().unwrap();
    let msg_c = msg.clone();
    let json = ws.parse_message::<Any>(msg);
    if let Err(e) = json {
        return Ok(());
    }
    let json = json.unwrap();
    let type_mess = &json.r#type;

    match type_mess {
        MessageType::GET_LOCALE => {
            ws.get_locale(msg_c, out, conn_id);
        }
        MessageType::GET_USER_ID => {
            ws.get_user_id(msg_c, out, conn_id);
        }
        _ => {
            warn!("Default case of message: {:?}", json);
        }
    };

    Ok(())
}
