use crate::{
    locales::{Client, LocaleValue},
    value_to_string,
};
use log::warn;

use serde::{Deserialize, Serialize};
use serde_json::{from_str, to_string, Value};
use std::{fmt::Display, str::FromStr};

use webrtc::{
    ice_transport::ice_candidate::RTCIceCandidateInit,
    peer_connection::sdp::session_description::RTCSessionDescription,
};

#[allow(non_snake_case)]
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct MessageArgs<T> {
    pub id: String,
    pub connId: String,
    pub r#type: MessageType,
    pub data: T,
}

impl<T> Display for MessageArgs<T>
where
    T: std::fmt::Debug,
{
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{:?}", self)
    }
}

#[allow(non_camel_case_types)]
#[derive(Serialize, Deserialize, PartialEq, Debug, Clone)]
pub enum MessageType {
    SET_LOCALE,
    GET_LOCALE,
    GET_USER_ID,
    SET_USER_ID,
    GET_LOGIN,
    TOKEN,
    OFFER,
    CANDIDATE,
    ANSWER,
    GET_ROOM,
    SET_ROOM,
    GET_CHAT_UNIT,
    GET_SETTINGS_UNIT,
    SET_ERROR,
    GET_ROOM_GUESTS,
    SET_ROOM_GUESTS,
    SET_CHANGE_UNIT,
    GET_MUTE,
    SET_MUTE,
    GET_NEED_RECONNECT,
    GET_CLOSE_PEER_CONNECTION,
    SET_CLOSE_PEER_CONNECTION,
    GET_ROOM_MESSAGE,
    SET_ROOM_MESSAGE,
    SET_CHAT_UNIT,
    SET_SETTINGS_UNIT,
    GET_CHAT_MESSAGES,
    SET_CHAT_MESSAGES,
    GET_EDIT_MESSAGE,
    SET_EDIT_MESSAGE,
    GET_CREATE_MESSAGE,
    SET_CREATE_MESSAGE,
    GET_CREATE_QUOTE,
    SET_CREATE_QUOTE,
    GET_DELETE_MESSAGE,
    SET_DELETE_MESSAGE,
    GET_TO_MUTE,
    GET_TO_BAN,
    GET_TO_UNMUTE,
    GET_TO_UNBAN,
    SET_BAN_LIST,
    SET_MUTE_LIST,
    GET_RECORD,
    SET_RECORDING,
    GET_VIDEO_FIND_MANY,
    SET_VIDEO_FIND_MANY,
    GET_VIDEO_FIND_FIRST,
    SET_VIDEO_FIND_FIRST,
    GET_ASK_FLOOR,
    SET_ASK_FLOOR,
    GET_MUTE_FOR_ALL,
    SET_MUTE_FOR_ALL,
    GET_BLOCK_CHAT,
    SET_BLOCK_CHAT,
    GET_VIDEO_TRACK,
    SET_VIDEO_TRACK,
    GET_TO_ADMIN,
    SET_TO_ADMIN,
    GET_VIDEO_SETTINGS,
    SET_CREATE_VIDEO,
    GET_VIDEO_DELETE,
    SET_VIDEO_DELETE,
    GET_VIDEO_UPDATE,
    SET_VIDEO_UPDATE,
}

impl Display for MessageType {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{:?}", self)
    }
}

impl FromStr for MessageType {
    type Err = ();
    fn from_str(input: &str) -> Result<MessageType, ()> {
        match input {
            "GET_LOCALE" => Ok(MessageType::GET_LOCALE),
            "SET_LOCALE" => Ok(MessageType::SET_LOCALE),
            "GET_USER_ID" => Ok(MessageType::GET_USER_ID),
            "SET_USER_ID" => Ok(MessageType::SET_USER_ID),
            "GET_LOGIN" => Ok(MessageType::GET_LOGIN),
            "TOKEN" => Ok(MessageType::TOKEN),
            "OFFER" => Ok(MessageType::OFFER),
            "ANSWER" => Ok(MessageType::ANSWER),
            "CANDIDATE" => Ok(MessageType::CANDIDATE),
            "GET_ROOM" => Ok(MessageType::GET_ROOM),
            "SET_ROOM" => Ok(MessageType::SET_ROOM),
            "GET_CHAT_UNIT" => Ok(MessageType::GET_CHAT_UNIT),
            "GET_SETTINGS_UNIT" => Ok(MessageType::GET_SETTINGS_UNIT),
            "SET_ERROR" => Ok(MessageType::SET_ERROR),
            "GET_ROOM_GUESTS" => Ok(MessageType::GET_ROOM_GUESTS),
            "SET_ROOM_GUESTS" => Ok(MessageType::SET_ROOM_GUESTS),
            "SET_CHANGE_UNIT" => Ok(MessageType::SET_CHANGE_UNIT),
            "GET_MUTE" => Ok(MessageType::GET_MUTE),
            "GET_NEED_RECONNECT" => Ok(MessageType::GET_NEED_RECONNECT),
            "SET_MUTE" => Ok(MessageType::SET_MUTE),
            "GET_CLOSE_PEER_CONNECTION" => Ok(MessageType::GET_CLOSE_PEER_CONNECTION),
            "SET_CLOSE_PEER_CONNECTION" => Ok(MessageType::SET_CLOSE_PEER_CONNECTION),
            "GET_ROOM_MESSAGE" => Ok(MessageType::GET_ROOM_MESSAGE),
            "SET_ROOM_MESSAGE" => Ok(MessageType::SET_ROOM_MESSAGE),
            "SET_CHAT_UNIT" => Ok(MessageType::SET_CHAT_UNIT),
            "SET_SETTINGS_UNIT" => Ok(MessageType::SET_SETTINGS_UNIT),
            "GET_CHAT_MESSAGES" => Ok(MessageType::GET_CHAT_MESSAGES),
            "SET_CHAT_MESSAGES" => Ok(MessageType::SET_CHAT_MESSAGES),
            "GET_EDIT_MESSAGE" => Ok(MessageType::GET_EDIT_MESSAGE),
            "SET_EDIT_MESSAGE" => Ok(MessageType::SET_EDIT_MESSAGE),
            "GET_CREATE_MESSAGE" => Ok(MessageType::GET_CREATE_MESSAGE),
            "SET_CREATE_MESSAGE" => Ok(MessageType::SET_CREATE_MESSAGE),
            "GET_CREATE_QUOTE" => Ok(MessageType::GET_CREATE_QUOTE),
            "SET_CREATE_QUOTE" => Ok(MessageType::SET_CREATE_QUOTE),
            "GET_DELETE_MESSAGE" => Ok(MessageType::GET_DELETE_MESSAGE),
            "SET_DELETE_MESSAGE" => Ok(MessageType::SET_DELETE_MESSAGE),
            "GET_TO_MUTE" => Ok(MessageType::GET_TO_MUTE),
            "GET_TO_BAN" => Ok(MessageType::GET_TO_BAN),
            "GET_TO_UNMUTE" => Ok(MessageType::GET_TO_UNMUTE),
            "GET_TO_UNBAN" => Ok(MessageType::GET_TO_UNBAN),
            "SET_BAN_LIST" => Ok(MessageType::SET_BAN_LIST),
            "SET_MUTE_LIST" => Ok(MessageType::SET_MUTE_LIST),
            "GET_RECORD" => Ok(MessageType::GET_RECORD),
            "SET_RECORDING" => Ok(MessageType::SET_RECORDING),
            "GET_VIDEO_FIND_MANY" => Ok(MessageType::GET_VIDEO_FIND_MANY),
            "SET_VIDEO_FIND_MANY" => Ok(MessageType::SET_VIDEO_FIND_MANY),
            "GET_VIDEO_FIND_FIRST" => Ok(MessageType::GET_VIDEO_FIND_FIRST),
            "SET_VIDEO_FIND_FIRST" => Ok(MessageType::SET_VIDEO_FIND_FIRST),
            "GET_ASK_FLOOR" => Ok(MessageType::GET_ASK_FLOOR),
            "SET_ASK_FLOOR" => Ok(MessageType::SET_ASK_FLOOR),
            "GET_MUTE_FOR_ALL" => Ok(MessageType::GET_MUTE_FOR_ALL),
            "SET_MUTE_FOR_ALL" => Ok(MessageType::SET_MUTE_FOR_ALL),
            "GET_BLOCK_CHAT" => Ok(MessageType::GET_BLOCK_CHAT),
            "SET_BLOCK_CHAT" => Ok(MessageType::SET_BLOCK_CHAT),
            "GET_VIDEO_TRACK" => Ok(MessageType::GET_VIDEO_TRACK),
            "SET_VIDEO_TRACK" => Ok(MessageType::SET_VIDEO_TRACK),
            "GET_TO_ADMIN" => Ok(MessageType::GET_TO_ADMIN),
            "SET_TO_ADMIN" => Ok(MessageType::SET_TO_ADMIN),
            "GET_VIDEO_SETTINGS" => Ok(MessageType::GET_VIDEO_SETTINGS),
            "SET_CREATE_VIDEO" => Ok(MessageType::SET_CREATE_VIDEO),
            "GET_VIDEO_DELETE" => Ok(MessageType::GET_VIDEO_DELETE),
            "SET_VIDEO_DELETE" => Ok(MessageType::SET_VIDEO_DELETE),
            "GET_VIDEO_UPDATE" => Ok(MessageType::GET_VIDEO_UPDATE),
            "SET_VIDEO_UPDATE" => Ok(MessageType::SET_VIDEO_UPDATE),
            _ => {
                warn!("Default case of MessageType: {}", input);
                Err(())
            }
        }
    }
}

#[derive(Serialize, Debug, Clone)]
pub struct RoomList {
    pub room_id: String,
    pub users: Vec<String>,
}

pub trait FromValue {
    fn from(value: &Value) -> Self;
}

#[derive(Debug, Clone, Deserialize)]
pub struct GetLocale {
    pub locale: LocaleValue,
}

impl FromValue for GetLocale {
    fn from(value: &Value) -> Self {
        Self {
            locale: LocaleValue::from_str(value["locale"].as_str().unwrap()).unwrap(),
        }
    }
}

#[derive(Serialize, Clone)]
pub struct SetLocale {
    pub locale: Client<'static>,
}

#[allow(non_snake_case)]
#[derive(Debug, Clone)]
pub struct GetSettingsUnit {
    pub userId: String,
    pub locale: LocaleValue,
}

pub type SetSettingsUnit = ();

#[allow(non_snake_case)]
#[derive(Debug, Clone, Deserialize)]
pub struct GetChatUnit {
    pub userId: String,
    pub locale: LocaleValue,
}

impl FromValue for GetChatUnit {
    fn from(value: &Value) -> Self {
        Self {
            userId: value_to_string!(value["userId"]),
            locale: LocaleValue::from_str(value["locale"].as_str().unwrap()).unwrap(),
        }
    }
}

pub type SetChatUnit = ();

#[allow(non_snake_case)]
#[derive(Debug, Clone, Deserialize)]
#[cfg_attr(test, derive(Serialize))]
pub struct GetUserId {
    pub isRoom: Option<bool>,
    pub userName: String,
    pub locale: LocaleValue,
}

impl FromValue for GetUserId {
    fn from(value: &Value) -> Self {
        Self {
            isRoom: value["isRoom"].as_bool(),
            userName: value_to_string!(value["userName"]),
            locale: LocaleValue::from_str(value["locale"].as_str().unwrap()).unwrap(),
        }
    }
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[allow(non_snake_case)]
pub struct SetUserId {
    pub name: String,
}

#[cfg(test)]
impl FromValue for SetUserId {
    fn from(value: &Value) -> Self {
        Self {
            name: value_to_string!(value["name"]),
        }
    }
}

pub type Any = ();

impl FromValue for Any {
    fn from(_: &Value) -> Self {
        ()
    }
}

#[derive(Debug, Clone, Deserialize)]
#[cfg_attr(test, derive(Serialize))]
#[allow(non_snake_case)]
pub struct GetRoom {
    pub userId: String,
    pub mimeType: String,
    pub isPublic: bool,
}

impl FromValue for GetRoom {
    fn from(value: &Value) -> Self {
        Self {
            isPublic: value["isPublic"].as_bool().unwrap(),
            mimeType: value_to_string!(value["mimeType"]),
            userId: value_to_string!(value["userId"]),
        }
    }
}

#[derive(Serialize, Debug, Clone)]
#[allow(non_snake_case)]
pub struct SetRoom {
    pub isOwner: bool,
    pub asked: Vec<String>,
}

#[cfg(test)]
impl FromValue for SetRoom {
    fn from(value: &Value) -> Self {
        Self {
            isOwner: value["isOwner"].as_bool().unwrap(),
            asked: value["asked"]
                .as_array()
                .unwrap()
                .iter()
                .map(|v| value_to_string!(v))
                .collect(),
        }
    }
}

#[derive(Serialize, Debug, Clone)]
pub struct _RTCSessionDescription {
    pub r#type: String,
    pub sdp: String,
}

#[derive(Serialize, Debug, Clone, Deserialize)]
#[allow(non_snake_case)]
pub struct Offer {
    pub sdp: RTCSessionDescription,
    pub userId: String,
    pub target: String,
    pub mimeType: String,
    pub roomId: String,
}

impl FromValue for Offer {
    fn from(value: &Value) -> Self {
        Self {
            sdp: from_str::<RTCSessionDescription>(
                to_string(&_RTCSessionDescription {
                    sdp: value_to_string!(value["sdp"]["sdp"]),
                    r#type: value_to_string!(value["sdp"]["type"]),
                })
                .unwrap()
                .as_str(),
            )
            .unwrap(),
            userId: value_to_string!(value["userId"]),
            mimeType: value_to_string!(value["mimeType"]),
            target: value_to_string!(value["target"]),
            roomId: value_to_string!(value["roomId"]),
        }
    }
}

#[derive(Serialize, Debug, Clone, Deserialize)]
#[allow(non_snake_case)]
pub struct Candidate {
    pub candidate: RTCIceCandidateInit,
    pub userId: String,
    pub target: String,
    pub roomId: String,
}

impl FromValue for Candidate {
    fn from(value: &Value) -> Self {
        Self {
            candidate: RTCIceCandidateInit {
                candidate: value_to_string!(value["candidate"]["candidate"]),
                username_fragment: if let Some(v) = value["candidate"]["usernameFragment"].as_str()
                {
                    Some(v.to_string())
                } else {
                    None
                },
                sdp_mid: if let Some(v) = value["candidate"]["sdpMid"].as_str() {
                    Some(v.to_string())
                } else {
                    None
                },
                sdp_mline_index: if let Some(v) = value["candidate"]["sdpMLineIndex"].as_u64() {
                    Some(v as u16)
                } else {
                    None
                },
            },
            userId: value_to_string!(value["userId"]),
            target: value_to_string!(value["target"]),
            roomId: value_to_string!(value["roomId"]),
        }
    }
}

#[derive(Serialize, Debug, Clone)]
#[allow(non_snake_case)]
pub struct Answer {
    pub sdp: RTCSessionDescription,
    pub userId: String,
    pub target: String,
}

impl FromValue for Answer {
    fn from(value: &Value) -> Self {
        Self {
            sdp: from_str::<RTCSessionDescription>(
                to_string(&_RTCSessionDescription {
                    sdp: value_to_string!(value["sdp"]["sdp"]),
                    r#type: value_to_string!(value["sdp"]["type"]),
                })
                .unwrap()
                .as_str(),
            )
            .unwrap(),
            userId: value_to_string!(value["userId"]),
            target: value_to_string!(value["target"]),
        }
    }
}

#[derive(Serialize, Debug, Clone)]
pub enum EventName {
    Delete,
    Add,
    Added,
}

impl EventName {
    pub fn to_string(self) -> String {
        match self {
            EventName::Add => "add",
            EventName::Added => "added",
            EventName::Delete => "delete",
        }
        .to_string()
    }
}

#[derive(Serialize, Debug, Clone, Deserialize)]
#[allow(non_snake_case)]
pub struct SetChangeUnit {
    pub target: String,
    pub name: String,
    pub eventName: String,
    pub roomLength: usize,
    pub isOwner: bool,
    pub muteds: Vec<String>,
    pub banneds: Vec<String>,
    pub asked: Vec<String>,
    pub adminMuteds: Vec<String>,
}
