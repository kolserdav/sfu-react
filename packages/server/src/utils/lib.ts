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
import { LOG_LEVEL } from './constants';

// eslint-disable-next-line no-unused-vars
enum LogLevel {
  log = 0,
  info = 1,
  warn = 2,
  error = 3,
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const log = (type: keyof typeof LogLevel, text: string, data?: any, cons?: boolean) => {
  const Red = '\x1b[31m';
  const Reset = '\x1b[0m';
  const Bright = '\x1b[1m';
  const Yellow = '\x1b[33m';
  const Dim = '\x1b[2m';
  const Cyan = '\x1b[36m';
  if (cons) {
    console.log(type === 'info' ? Cyan : type === 'warn' ? Yellow : type === 'error' ? Red : Reset);
    console[type](type, Reset, text, Bright, data, Reset);
  } else {
    if (LogLevel[type] >= LOG_LEVEL) {
      console[type](
        type === 'error' ? Red : type === 'warn' ? Yellow : Bright,
        type,
        Reset,
        text,
        Dim,
        data,
        Reset
      );
    }
  }
};
