#[macro_use]
extern crate log;
mod ws;
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

fn main() {
    env_logger::builder().format_timestamp(None).init();

    let ws = WS::new();

    ws.listen_ws("127.0.0.1:3001", handle_ws);
}

fn handle_ws(
    ws: Arc<Mutex<WS>>,
    msg: Message,
    conn_id: Uuid,
    socket: Arc<Mutex<WebSocket<TcpStream>>>,
) -> Result<(), ()> {
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
            ws.get_locale(msg_c, conn_id, socket);
        }
        MessageType::GET_USER_ID => {
            ws.get_user_id(msg_c, conn_id, socket);
        }
        _ => {
            warn!("Default case of message: {:?}", json);
        }
    };

    Ok(())
}
