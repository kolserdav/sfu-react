pub mod constants;
use std::{fmt::Debug, str::FromStr};

use constants::*;
use once_cell::sync::Lazy;
use serde_json::Result as SerdeResult;
use tokio_tungstenite::tungstenite::Message;
use url::Url;

use crate::ws::messages::{FromValue, MessageArgs, MessageType};

pub fn get_peer_id(user_id: String, target: String, conn_id: String) -> String {
    format!("{}{}{}{}{}", user_id, DELIMITER, target, DELIMITER, conn_id)
}

pub fn parse_message<T>(msg: Message) -> SerdeResult<MessageArgs<T>>
where
    T: FromValue + Debug,
{
    let msg_str = msg.to_string();
    let json: serde_json::Value = serde_json::from_str(msg_str.as_str()).map_err(|err| {
        error!("Failed parse JSON: {:?}", err);
        err
    })?;
    debug!("Parse message: {}", json);
    Ok(MessageArgs {
        id: json["id"].to_string().replace("\"", ""),
        connId: json["connId"].to_string().replace("\"", ""),
        r#type: MessageType::from_str(json["type"].as_str().unwrap()).unwrap(),
        data: T::from(&json["data"]),
    })
}

pub fn get_ws_address() -> String {
    format!("{}:{}", Lazy::force(&HOST), Lazy::force(&PORT)).replace("\"", "")
}

pub fn get_ws_url() -> Url {
    Url::parse(
        &format!("ws://{}:{}/room", Lazy::force(&HOST), Lazy::force(&PORT)).replace("\"", ""),
    )
    .unwrap()
}

#[macro_export]
macro_rules! value_to_string {
    ($val:expr) => {
        $val.as_str().expect("Failed stringify value").to_string()
    };
}
