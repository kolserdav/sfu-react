/******************************************************************************************
 * Repository: https://github.com/kolserdav/werift-sfu-react.git
 * File name: lang.ts
 * Author: Sergey Kolmiller
 * Email: <uyem.ru@gmail.com>
 * License: MIT
 * License text: See in LICENSE file
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Wed Aug 24 2022 14:14:09 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/
import type { LocaleServer } from '../../types/interfaces';

const lang: LocaleServer = {
  server: {
    error: 'Server error',
    roomInactive: 'Room is inactive',
    errorSendMessage: 'Error send message',
    youAreBanned: 'You are banned',
    videoRecordStop: 'Video record stop',
    forbidden: 'Forbidden',
    notAuthorised: 'Not authorised',
    duplicateTab:
      'An unsupported attempt was made to reconnect in a new tab. Only one point can be connected to a room at a time.',
  },
  client: {
    shareScreen: 'Share screen',
    changeTheme: 'Change theme',
    send: 'Send',
    quote: 'Quote',
    edit: 'Edit',
    edited: 'edited',
    delete: 'Delete',
    erorGetSound: 'Share scren without sound',
    errorGetCamera: 'Error get camera access',
    errorGetDisplay: 'Error get display media',
    noMessages: 'No messages yet',
    loading: 'Loading ...',
    getDisplayCancelled: 'Share display cancelled',
    mute: 'Mute',
    unmute: 'Unmute',
    ban: 'Ban',
    unban: 'Unban',
    isAdminOfRoom: 'Is admin of room',
    youAreAdminOfRoom: 'You are admin of room',
    banneds: 'Banned users',
    recordVideo: 'Record video',
    recordVideoStop: 'Stop video record',
    videoRecording: 'Video recording',
    linkCopied: 'Room link copied',
    generalSettings: 'General settings',
    recordActions: 'Record actions',
    changeLang: 'Change panel lang',
    darkTheme: 'Dark theme',
    startRecord: 'Start record',
    recording: 'Recording ...',
    stopRecord: 'Stop record',
    willBeReconnect: 'The duplicate tab will be redirected to the previous page',
    guests: 'Room guests',
    micOff: 'Turn off the microphone',
    micOn: 'Turn on the microphone',
    cameraOff: 'Turn off the camera',
    cameraOn: 'Turn on the camera',
    copyRoomLink: 'Copy room address',
    editMessage: 'Message edited',
    messageDeleted: 'Message deleted',
    askForTheFloor: 'Ask for the floor',
    requestedTheFloor: 'Requested the floor',
    shortAdmin: 'admin',
  },
};

export default lang;
