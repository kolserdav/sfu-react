/******************************************************************************************
 * Repository: https://github.com/kolserdav/werift-sfu-react.git
 * File name: lib.ts
 * Author: Sergey Kolmiller
 * Email: <uyem.ru@gmail.com>
 * License: MIT
 * License text: See in LICENSE file
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Fri Jul 29 2022 21:35:51 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/
import { format } from 'date-fns';
import { LOG_LEVEL, CODECS } from './constants';
import { LocaleClient, LocaleDefault, LocaleValue } from '../types/interfaces';

// eslint-disable-next-line no-unused-vars
enum LogLevel {
  // eslint-disable-next-line no-unused-vars
  log = 0,
  // eslint-disable-next-line no-unused-vars
  info = 1,
  // eslint-disable-next-line no-unused-vars
  warn = 2,
  // eslint-disable-next-line no-unused-vars
  error = 3,
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
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

const locales: Record<string, LocaleClient> = {};

export const getLocale = (value: LocaleValue): LocaleClient => {
  if (locales[value]) {
    return locales[value];
  }
  try {
    // eslint-disable-next-line global-require
    locales[value] = require(`../locales/${value}/lang`).default;
  } catch (e) {
    if (!locales[LocaleDefault]) {
      // eslint-disable-next-line global-require
      locales[LocaleDefault] = require(`../locales/${LocaleDefault}/lang`).default;
    }
    return locales[LocaleDefault];
  }
  return locales[value];
};

export const getPathname = (): string | null => {
  let res = null;
  if (typeof window !== 'undefined') {
    res = window.location.pathname;
  }
  return res;
};

export const dateToString = (date: Date) => format(date, 'dd.MM.yyyy');

export const dateToTime = (date: Date) => format(date, 'hh:mm');
