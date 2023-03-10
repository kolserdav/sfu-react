#[macro_use]
extern crate log;
mod _ws;
use _ws::WS;
use std::collections::HashMap;
mod locales;

fn main() {
    env_logger::builder().format_timestamp(None).init();

    let mut ws = WS::new();

    ws.listen_ws("127.0.0.1:3001");
}
