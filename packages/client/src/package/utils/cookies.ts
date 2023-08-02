/******************************************************************************************
 * Repository: https://github.com/kolserdav/werift-sfu-react.git
 * File name: cookies.ts
 * Author: Sergey Kolmiller
 * Email: <kolserdav@uyem.ru>
 * License: MIT
 * License text: See in LICENSE file
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Wed Aug 02 2023 23:56:49 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/
import { Cookies } from 'react-cookie';
import { LocaleValue } from '../types/interfaces';

const cookies = new Cookies();

export enum CookieName {
  // eslint-disable-next-line no-unused-vars
  lang = 'lang',
}

type CookieValue<T extends keyof typeof CookieName> = T extends CookieName.lang
  ? LocaleValue
  : never;

export function getCookie<T extends keyof typeof CookieName>(name: T): CookieValue<T> | null {
  const _cookies = cookies.get(name);
  return _cookies || null;
}

export function setCookie<T extends keyof typeof CookieName>(
  name: T,
  value: CookieValue<T>,
  options?: {
    expires?: Date;
  }
) {
  let date;
  if (options) {
    const { expires } = options;
    date = expires;
  }
  if (!options?.expires) {
    date = new Date();
    date.setFullYear(date.getFullYear() + 1);
  }
  cookies.set(name, value, {
    expires: date,
    path: '/',
    sameSite: true,
    secure: true,
  });
}
