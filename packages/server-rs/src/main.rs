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

static _RTC: Lazy<RTC> = Lazy::new(|| RTC::new());
static CHAT: Lazy<Chat> = Lazy::new(|| Chat::new());
static _WS: Lazy<WS> = Lazy::new(|| WS::new(Lazy::get(&_RTC).unwrap(), Lazy::get(&CHAT).unwrap()));

#[tokio::main]
async fn main() {
    env_logger::builder().format_timestamp(None).init();

    _WS.listen_ws("127.0.0.1:3001").await;
}
