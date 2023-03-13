#[macro_use]
extern crate log;
mod _ws;
use _ws::{
    messages::{Any, MessageType},
    WS,
};
use std::{
    net::TcpStream,
    sync::{Arc, Mutex},
};
use uuid::Uuid;
mod locales;
pub mod thread_pool;
use tungstenite::{Message, WebSocket};

fn main() {
    env_logger::builder().format_timestamp(None).init();

    let ws = WS::new();

    ws.listen_ws("127.0.0.1:3001");
}
