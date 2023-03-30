#[macro_use]
extern crate log;
pub mod ws;
use chat::Chat;

mod tests;

use prelude::{constants::dotenv_init, get_ws_address};
use ws::WS;
mod locales;

mod rtc;
use rtc::RTC;

mod chat;
pub mod common;

#[macro_use]
pub mod prelude;

use once_cell::sync::Lazy;

static _WS: Lazy<WS> = Lazy::new(|| WS::new(RTC::new(), Chat::new()));

pub async fn server() {
    env_logger::builder().format_timestamp(None).init();

    dotenv_init().expect(".env file not found");

    _WS.listen_ws(&get_ws_address()).await;
}
