/******************************************************************************************
 * Repository: https://github.com/kolserdav/webrtc-sfu-werift-react.git
 * File name: lib.ts
 * Author: Sergey Kolmiller
 * Email: <uyem.ru@gmail.com>
 * License: MIT
 * License text: Show LICENSE file
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Thu Jul 28 2022 22:20:46 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/
import { LOG_LEVEL, CODECS } from './constants';

// eslint-disable-next-line no-unused-vars
enum LogLevel {
  log = 0,
  info = 1,
  warn = 2,
  error = 3,
}

export const log = (type: keyof typeof LogLevel, text: string, data?: any) => {
  if (LogLevel[type] >= LOG_LEVEL) {
    // eslint-disable-next-line no-console
    console[type](type, text, data);
  }
};

export const getRoomId = (pathname: string) => {
  const lastSection = pathname.match(/\/[a-zA-Z0-9_-]+$/);
  const roomId = lastSection ? lastSection[0] : '';
  return roomId.replace(/^\//, '');
};

export const parseMessage = (message: string): object => {
  let result = {};
  try {
    result = JSON.parse(message);
  } catch (e) {
    /** */
  }
  return result;
};

export const parseQueryString = (query: string): Record<string, string> | null => {
  const arr = query.replace(/\??/, '').split('&');
  let res: Record<string, string> | null = null;
  arr.forEach((item) => {
    if (item === '') {
      return;
    }
    if (res === null) {
      res = {};
    }
    const propReg = /^\w+=/;
    const prop = item.match(propReg);
    const propStr = prop ? prop[0].replace('=', '') : '';
    res[propStr] = item.replace(propReg, '');
  });
  return res;
};

export const getCodec = () => {
  let mimeType = '';
  for (let i = 0; CODECS[i]; i++) {
    const item = CODECS[i];
    if (MediaRecorder.isTypeSupported(item) && MediaSource.isTypeSupported(item)) {
      log('info', 'Supported mimetype is', item);
      mimeType = item;
      break;
    }
  }
  if (/codecs=/.test(mimeType)) {
    const codec = mimeType.match(/[a-zA-Z0-9,.]+$/);
    const codecV = codec ? codec[0] : 'webm';
    mimeType = `video/${codecV}`;
  }
  return mimeType;
};
