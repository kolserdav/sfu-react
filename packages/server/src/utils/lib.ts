/******************************************************************************************
 * Repository: https://github.com/kolserdav/werift-sfu-react.git
 * File name: lib.ts
 * Author: Sergey Kolmiller
 * Email: <uyem.ru@gmail.com>
 * License: MIT
 * License text: See in LICENSE file
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Wed Aug 24 2022 14:14:09 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/
import werift from 'werift';
import { format } from 'date-fns';
import path from 'path';
import { AUTH_UNIT_ID_DEFAULT, IS_DEV, LOG_LEVEL } from './constants';
import {
  LocaleServer,
  LocaleDefault,
  LocaleValue,
  RECORD_VIDEOS_PATH,
  VIDEO_BACKGROUNDS_PATH,
} from '../types/interfaces';
import en from '../locales/en/lang';
import ru from '../locales/ru/lang';

const locales: Record<string, LocaleServer> = {
  en,
  ru,
};

let logLevel = LOG_LEVEL;

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
export const log = (type: keyof typeof LogLevel, text: string, _data?: any, cons?: boolean) => {
  const Red = '\x1b[31m';
  const Reset = '\x1b[0m';
  const Bright = '\x1b[1m';
  const Yellow = '\x1b[33m';
  const Dim = '\x1b[2m';
  const Cyan = '\x1b[36m';
  const date = IS_DEV ? format(new Date(), 'hh:mm:ss') : '';
  if (cons) {
    // eslint-disable-next-line no-console
    console.log(
      type === 'info' ? Cyan : type === 'warn' ? Yellow : type === 'error' ? Red : Reset,
      '\n'
    );
    // eslint-disable-next-line no-console
    console[type](IS_DEV ? date : '', type, Reset, text, Bright, _data, Reset);
  } else if (LogLevel[type] >= logLevel || Number.isNaN(logLevel)) {
    // eslint-disable-next-line no-console
    console[type](
      IS_DEV ? date : '',
      type === 'error' ? Red : type === 'warn' ? Yellow : Bright,
      type,
      Reset,
      text,
      Dim,
      _data,
      Reset,
      '\n'
    );
  }
};

export const setLogLevel = (_logLevel: LogLevel | undefined) => {
  if (_logLevel !== undefined) {
    logLevel = _logLevel;
  }
};

export const getLocale = (value: LocaleValue): LocaleServer =>
  locales[value] || locales[LocaleDefault];

export const checkSignallingState = (signallingState: werift.RTCPeerConnection['signalingState']) =>
  ['have-remote-offer', 'have-local-pranswer'].includes(signallingState);

export const checkTockenDefault = async (token: string) => {
  log('warn', 'Check token callback not set, use default all yes', { token });
  return true;
};

export const cleanDbUrl = (db?: string) => {
  const dbUrl = db || (process.env.DATABASE_URL as string);
  let password: RegExpMatchArray | string | null = dbUrl.match(/:(?!\/).+@/);
  const _password = password ? password[0] : '';
  password = ':';
  new Array(_password.length - 2).fill('•').forEach((item) => {
    password += item;
  });
  password = `${password}@`;
  return dbUrl.replace(_password, password);
};

export const createRandHash = (length: number) => {
  const getRandRange = (min: number, max: number): number => {
    const rand = Math.random() * (max - min) + min;
    if (rand > 90 && rand < 97) {
      return getRandRange(min, max);
    }
    return rand;
  };

  const min = 65;
  const max = 122;

  let hash = '';
  for (let i = 0; i < length; i++) {
    const randCode = getRandRange(min, max);
    hash += String.fromCharCode(randCode);
  }
  return hash;
};

export const parseQueryString = (query: string): Record<string, string> => {
  const arr = query.replace(/\??/, '').split('&');
  const res: Record<string, string> = {};
  arr.forEach((item) => {
    if (item === '') {
      return;
    }
    const propReg = /^\w+=/;
    const prop = item.match(propReg);
    const _prop = prop ? prop[0] : null;
    if (!_prop) {
      return;
    }
    const propStr = _prop.replace('=', '');
    res[propStr] = item.replace(propReg, '');
  });
  return res;
};

export const getVideoPath = ({
  cloudPath,
  roomId,
  name,
}: {
  cloudPath: string;
  roomId: string | number;
  name: string;
}) => path.resolve(cloudPath, `./${RECORD_VIDEOS_PATH}`, `./${roomId}`, `./${name}`);

export const getVideosDirPath = ({ cloudPath }: { cloudPath: string }) =>
  path.resolve(cloudPath, `./${RECORD_VIDEOS_PATH}`);

export const getBackgroundsDirPath = ({ cloudPath }: { cloudPath: string }) =>
  path.resolve(cloudPath, `./${VIDEO_BACKGROUNDS_PATH}`);

export const getRoomDirPath = ({
  videosDirPath,
  roomId,
}: {
  videosDirPath: string;
  roomId: string | number;
}) => path.resolve(videosDirPath, `./${roomId}`);

export const checkDefaultAuth = ({ unitId }: { unitId: string }) => unitId === AUTH_UNIT_ID_DEFAULT;
