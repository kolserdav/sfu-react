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
import { LOG_LEVEL } from './constants';
import { LocaleServer, LocaleDefault, LocaleValue } from '../types/interfaces';
import en from '../locales/en/lang';

const locales: Record<string, LocaleServer> = {
  en,
};

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
export const log = (type: keyof typeof LogLevel, text: string, data?: any, cons?: boolean) => {
  const Red = '\x1b[31m';
  const Reset = '\x1b[0m';
  const Bright = '\x1b[1m';
  const Yellow = '\x1b[33m';
  const Dim = '\x1b[2m';
  const Cyan = '\x1b[36m';
  if (cons) {
    // eslint-disable-next-line no-console
    console.log(type === 'info' ? Cyan : type === 'warn' ? Yellow : type === 'error' ? Red : Reset);
    // eslint-disable-next-line no-console
    console[type](type, Reset, text, Bright, data, Reset);
  } else if (LogLevel[type] >= LOG_LEVEL) {
    // eslint-disable-next-line no-console
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
};

export const getLocale = (value: LocaleValue): LocaleServer =>
  locales[value] || locales[LocaleDefault];
