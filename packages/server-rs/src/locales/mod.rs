#![allow(non_snake_case)]
#![allow(dead_code)]

use std::{
    fmt::{Display, Formatter, Result as FmtResult},
    str::FromStr,
};

use serde::{Deserialize, Serialize};
mod en;
mod ru;

#[derive(Debug, Clone)]
pub enum LocaleValue {
    #[allow(non_camel_case_types)]
    ru,
    #[allow(non_camel_case_types)]
    en,
}

impl Display for LocaleValue {
    fn fmt(&self, f: &mut Formatter) -> FmtResult {
        write!(f, "{:?}", self)
    }
}

impl FromStr for LocaleValue {
    type Err = ();
    fn from_str(input: &str) -> Result<LocaleValue, ()> {
        match input {
            "ru" => Ok(LocaleValue::ru),
            "en" => Ok(LocaleValue::en),
            _ => Err(()),
        }
    }
}

#[derive(Clone, Copy, Serialize)]
pub struct Server<'a> {
    error: &'a str,
    roomInactive: &'a str,
    errorSendMessage: &'a str,
    youAreBanned: &'a str,
    videoRecordStop: &'a str,
    forbidden: &'a str,
    notAuthorised: &'a str,
    duplicateTab: &'a str,
    connected: &'a str,
    ownerCanNotBeDeleted: &'a str,
    ownerCanNotBeBanned: &'a str,
    badRequest: &'a str,
    notFound: &'a str,
    serverError: &'a str,
}

#[derive(Clone, Copy, Serialize)]
pub struct Client<'a> {
    shareScreen: &'a str,
    changeTheme: &'a str,
    send: &'a str,
    quote: &'a str,
    edit: &'a str,
    delete: &'a str,
    errorGetCamera: &'a str,
    errorGetDisplay: &'a str,
    erorGetSound: &'a str,
    edited: &'a str,
    noMessages: &'a str,
    loading: &'a str,
    getDisplayCancelled: &'a str,
    mute: &'a str,
    unmute: &'a str,
    ban: &'a str,
    unban: &'a str,
    isAdminOfRoom: &'a str,
    youAreAdminOfRoom: &'a str,
    banneds: &'a str,
    recordVideo: &'a str,
    videoRecording: &'a str,
    recordVideoStop: &'a str,
    linkCopied: &'a str,
    generalSettings: &'a str,
    recordActions: &'a str,
    changeLang: &'a str,
    darkTheme: &'a str,
    startRecord: &'a str,
    recording: &'a str,
    stopRecord: &'a str,
    willBeReconnect: &'a str,
    guests: &'a str,
    micOn: &'a str,
    micOff: &'a str,
    cameraOn: &'a str,
    cameraOff: &'a str,
    copyRoomLink: &'a str,
    editMessage: &'a str,
    messageDeleted: &'a str,
    askForTheFloor: &'a str,
    requestedTheFloor: &'a str,
    shortAdmin: &'a str,
    muteAll: &'a str,
    muteForNew: &'a str,
    blockChat: &'a str,
    unblockChat: &'a str,
    chatBlocked: &'a str,
    numberOfGuests: &'a str,
    noActiveVideoStreams: &'a str,
    videoDeviceRequired: &'a str,
    audioDeviceRequired: &'a str,
    setAsAdmin: &'a str,
    deleteFromAdmins: &'a str,
    inactivityDisconnect: &'a str,
    needDeleteVideo: &'a str,
    close: &'a str,
    changeVideoName: &'a str,
    save: &'a str,
}

#[derive(Clone, Copy, Serialize)]
pub struct Locale<'a> {
    pub Client: Client<'a>,
    pub Server: Server<'a>,
}

pub fn get_locale<'a>(value: LocaleValue) -> Locale<'a> {
    match value {
        LocaleValue::en => en::LANG,
        LocaleValue::ru => ru::LANG,
    }
}
