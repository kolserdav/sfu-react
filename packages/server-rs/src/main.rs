#[macro_use]
extern crate log;
mod _ws;
use _ws::{Static, WS};
use std::collections::HashMap;

fn main() {
    env_logger::builder().format_timestamp(None).init();
    let glob = Static {
        sockets: HashMap::new(),
    };
    let ws = WS::new(&glob);
    ws.listen_ws("127.0.0.1:3001");
}
