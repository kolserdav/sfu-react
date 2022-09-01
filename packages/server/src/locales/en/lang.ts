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
  },
};

export default lang;
