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
import { format } from 'date-fns';
import { CODECS } from './constants';
import { LogLevel } from '../types/interfaces';
import { DialogProps } from '../types';
import storeAlert, { changeAlert } from '../store/alert';
import storeLogLevel from '../store/logLevel';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const log = (type: keyof typeof LogLevel, text: string, data?: any, forUser = false) => {
  const { logLevel } = storeLogLevel.getState();
  if (LogLevel[type] >= logLevel) {
    // eslint-disable-next-line no-console
    console[type](type, text, data);
    if (forUser) {
      storeAlert.dispatch(
        changeAlert({
          alert: {
            type,
            children: text,
            open: true,
          },
        })
      );
    }
  }
};

export const getRoomId = (pathname: string) => {
  console.log(pathname);
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

export const parseQueryString = (): Record<string, string> | null => {
  const query = typeof window !== 'undefined' ? window.location.search : '';
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

export const getPathname = (): string | null => {
  let res = null;
  if (typeof window !== 'undefined') {
    res = window.location.pathname;
  }
  return res;
};

export const dateToString = (date: Date) => format(date, 'dd.MM.yyyy');

export const dateToTime = (date: Date) => format(date, 'HH:mm');

export function getUTCDate(date: string): Date {
  const dt = new Date(date);
  dt.setTime(dt.getTime() + dt.getTimezoneOffset() * 60 * 1000);
  return dt;
}

export const isMobile = () => {
  let result = false;
  if (typeof document !== 'undefined') {
    result = document.body.clientWidth <= 760;
  }
  return result;
};

export const getDialogPosition = ({
  _clientX,
  _clientY,
  width,
  height,
}: {
  _clientX: number;
  _clientY: number;
  width: number;
  height: number;
}) => {
  const { clientWidth, clientHeight } = document.body;
  const clientX = clientWidth / 2 < _clientX ? _clientX - width : _clientX;
  const clientY = clientHeight / 2 < _clientY ? _clientY - height : _clientY;
  return { clientX, clientY };
};

export const isClickByDialog = ({
  clientY,
  clientX,
  dialog,
}: {
  clientX: number;
  clientY: number;
  dialog: Omit<DialogProps, 'children'>;
}) => {
  const isX = clientX > dialog.clientX && clientX < dialog.clientX + dialog.width;
  const isY = clientY > dialog.clientY && clientY < dialog.clientY + dialog.height;
  return isX && isY;
};

export const rangeRandom = ({ min, max }: { min: number; max: number }) =>
  Math.floor(Math.random() * (max - min) + min);

export const checkIsRecord = (uid: string) => /record=/.test(uid);

export const getTime = (startTime: number) => {
  const nowTime = new Date().getTime();
  const diffTime = nowTime - startTime;
  const seconds = Math.floor(diffTime / 1000);
  const minutes = Math.floor(diffTime / 1000 / 60);
  const hours = Math.floor(diffTime / 1000 / 3600);
  const _seconds =
    seconds % 60 < 1 && seconds % 60 !== 0 ? seconds : seconds % 60 === 0 ? 0 : seconds % 60;
  const _minutes =
    minutes % 60 < 1 && minutes % 60 !== 0 ? minutes : minutes % 60 === 0 ? 0 : minutes % 60;
  return `${hours.toString().length === 1 ? '0' : ''}${hours}:${
    _minutes.toString().length === 1 ? '0' : ''
  }${_minutes}:${_seconds.toString().length === 1 ? '0' : ''}${_seconds}`;
};

export const getDocumentWidth = () => {
  let result = 0;
  if (typeof document !== 'undefined') {
    result = document.body.clientWidth;
  }
  return result;
};
