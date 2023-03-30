#![cfg(test)]

use crate::{
    locales::LocaleValue,
    prelude::{constants::dotenv_init, get_ws_url, parse_message},
    ws::messages::{Any, GetRoom, GetUserId, MessageArgs, MessageType, SetRoom, SetUserId},
};
use serde_json::to_string;
use tokio_tungstenite::tungstenite::{connect, Message};

#[test]
fn test() {
    dotenv_init().expect(".env file not found");

    client("1", "1");
}

fn client(room_id: &str, user_id: &str) {
    let (mut socket, _) = connect(get_ws_url()).expect("Can't connect");

    let msg = get_set_user_id_msg(user_id);

    socket
        .write_message(Message::Text(to_string(&msg).unwrap()))
        .unwrap();

    loop {
        let msg = socket.read_message().expect("Error reading message");

        let msg_c = msg.clone();
        println!("msg: {:?}", &msg);
        let json = parse_message::<Any>(msg);
        if let Err(e) = json {
            error!("Error handle WS: {:?}", e);
            return;
        }
        let json = json.unwrap();
        let type_mess = &json.r#type;

        match type_mess {
            MessageType::SET_USER_ID => {
                let json = parse_message::<SetUserId>(msg_c).unwrap();

                socket
                    .write_message(Message::Text(
                        to_string(&get_get_room_msg(room_id, user_id, json.connId)).unwrap(),
                    ))
                    .unwrap();
            }
            MessageType::SET_ROOM => {
                let json = parse_message::<SetRoom>(msg_c).unwrap();
                break;
            }
            _ => {
                println!("Default message: {:?}", msg_c);
            }
        }
    }
}

fn get_set_user_id_msg(uid: &str) -> MessageArgs<GetUserId> {
    MessageArgs {
        id: String::from(uid),
        r#type: MessageType::GET_USER_ID,
        connId: String::from(""),
        data: GetUserId {
            isRoom: None,
            locale: LocaleValue::en,
            userName: String::from("Test Bot"),
        },
    }
}

fn get_get_room_msg(room_id: &str, uid: &str, conn_id: String) -> MessageArgs<GetRoom> {
    MessageArgs {
        id: String::from(room_id),
        r#type: MessageType::GET_ROOM,
        connId: conn_id,
        data: GetRoom {
            isPublic: false,
            mimeType: String::from("VP8"),
            userId: String::from(uid),
        },
    }
}
