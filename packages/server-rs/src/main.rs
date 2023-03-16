#[macro_use]
extern crate log;
pub mod ws;
use chat::Chat;

use ws::WS;
mod locales;

mod rtc;
use rtc::RTC;

mod chat;
pub mod common;

use once_cell::sync::Lazy;

static _WS: Lazy<WS> = Lazy::new(|| WS::new(RTC::new(), Chat::new()));

#[tokio::main]
async fn main() {
    env_logger::builder().format_timestamp(None).init();

    _WS.listen_ws("127.0.0.1:3001").await;
}
