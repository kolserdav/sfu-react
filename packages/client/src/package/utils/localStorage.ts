/******************************************************************************************
 * Repository: https://github.com/kolserdav/werift-sfu-react.git
 * File name: localStorage.ts
 * Author: Sergey Kolmiller
 * Email: <uyem.ru@gmail.com>
 * License: MIT
 * License text: See in LICENSE file
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Wed Aug 24 2022 14:14:09 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/
import { ThemeType, Volumes } from '../types';
import { log } from './lib';

export enum LocalStorageName {
  // eslint-disable-next-line no-unused-vars
  THEME = 'THEME',
  // eslint-disable-next-line no-unused-vars
  HALL_OPEN = 'HALL_OPEN',
  // eslint-disable-next-line no-unused-vars
  VOLUMES = 'VOLUMES',
}

type LocalStorageValue<T extends keyof typeof LocalStorageName> = T extends LocalStorageName.THEME
  ? ThemeType
  : T extends LocalStorageName.HALL_OPEN
  ? boolean
  : T extends LocalStorageName.VOLUMES
  ? Record<string, Volumes>
  : never;

export function getLocalStorage<T extends keyof typeof LocalStorageName>(
  name: T
): LocalStorageValue<T> | null {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let result: any = null;
  if (typeof localStorage === 'undefined') {
    return null;
  }
  const raw = localStorage.getItem(name);
  if (raw) {
    try {
      result = JSON.parse(raw);
    } catch (e) {
      log('error', 'Error parse local storage value', e);
    }
  }
  return result;
}

export function setLocalStorage<T extends keyof typeof LocalStorageName>(
  name: T,
  value: LocalStorageValue<T>
) {
  if (typeof localStorage === 'undefined') {
    return;
  }
  localStorage.setItem(name, JSON.stringify(value));
}
