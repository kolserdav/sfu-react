#![cfg(test)]

use std::sync::Arc;

use crate::{
    locales::LocaleValue,
    prelude::{constants::dotenv_init, get_ws_url, parse_message},
    server,
    ws::messages::{Any, GetRoom, GetUserId, MessageArgs, MessageType, Offer, SetRoom, SetUserId},
};
use once_cell::sync::Lazy;
use serde_json::to_string;
use tokio::{
    spawn,
    sync::{mpsc::channel, Mutex},
};
use tokio_tungstenite::tungstenite::{connect, Message};
use webrtc::{
    api::{
        interceptor_registry::register_default_interceptors, media_engine::MediaEngine, APIBuilder,
    },
    ice_transport::{ice_candidate::RTCIceCandidate, ice_server::RTCIceServer},
    interceptor::registry::Registry,
    peer_connection::{
        configuration::RTCConfiguration, sdp::session_description::RTCSessionDescription,
        RTCPeerConnection,
    },
};

static PENDING_CANDIDATES: Lazy<Arc<Mutex<Vec<RTCIceCandidate>>>> =
    Lazy::new(|| Arc::new(Mutex::new(vec![])));

#[tokio::test(flavor = "multi_thread", worker_threads = 1)]
async fn test() {
    dotenv_init().expect(".env file not found");
    spawn(server());
    client("1", "1").await;
}

static VP8: &str = "VP8";

async fn client(room_id: &str, user_id: &str) {
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

                let config = RTCConfiguration {
                    ice_servers: vec![RTCIceServer {
                        urls: vec!["stun:stun.l.google.com:19302".to_owned()],
                        ..Default::default()
                    }],
                    ..Default::default()
                };

                // Create a MediaEngine object to configure the supported codec
                let mut m = MediaEngine::default();
                m.register_default_codecs().unwrap();

                let mut registry = Registry::new();

                // Use the default set of Interceptors
                registry = register_default_interceptors(registry, &mut m).unwrap();

                let api = APIBuilder::new()
                    .with_media_engine(m)
                    .with_interceptor_registry(registry)
                    .build();

                let peer_connection = Arc::new(api.new_peer_connection(config).await.unwrap());

                let pc = Arc::downgrade(&peer_connection);

                let pending_candidates2 = Arc::clone(&PENDING_CANDIDATES);

                let (tx, mut rx) = channel(10);

                let tx = Arc::new(tx);

                peer_connection.on_ice_candidate(Box::new(move |c: Option<RTCIceCandidate>| {
                    let tx = tx.clone();
                    println!("on_ice_candidate {:?}", c);

                    let pc2 = pc.clone();
                    let pending_candidates3 = Arc::clone(&pending_candidates2);

                    Box::pin(async move {
                        if let Some(c) = c {
                            if let Some(pc) = pc2.upgrade() {
                                tx.send(c).await.unwrap();
                            }
                        }
                    })
                }));

                let sdp = peer_connection.local_description().await.unwrap();

                socket
                    .write_message(Message::Text(
                        to_string(&get_offer_msg(
                            room_id.clone(),
                            user_id.to_string().clone(),
                            String::from("0"),
                            json.connId.clone(),
                            sdp,
                            VP8.clone(),
                        ))
                        .unwrap(),
                    ))
                    .unwrap();

                while let Some(c) = rx.recv().await {
                    println!("Cand: {:?}", c);
                }

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
            mimeType: String::from(VP8),
            userId: String::from(uid),
        },
    }
}

fn get_offer_msg(
    room_id: &str,
    user_id: String,
    target: String,
    conn_id: String,
    sdp: RTCSessionDescription,
    mime_type: &str,
) -> MessageArgs<Offer> {
    MessageArgs {
        id: String::from(room_id),
        r#type: MessageType::OFFER,
        connId: conn_id,
        data: Offer {
            roomId: String::from(room_id),
            mimeType: mime_type.to_string(),
            sdp,
            target,
            userId: user_id,
        },
    }
}
