/******************************************************************************************
 * Repository: https://github.com/kolserdav/werift-sfu-react.git
 * File name: index.ts
 * Author: Sergey Kolmiller
 * Email: <uyem.ru@gmail.com>
 * License: MIT
 * License text: See in LICENSE file
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Wed Aug 24 2022 14:14:09 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/
import { Colors } from '../Theme';
import { LocaleClient, LogLevel } from './interfaces';

export interface RoomProps {
  id: number | string;
  roomId: string | number;
  server: string;
  port: number;
  locale: LocaleClient['room'];
  colors?: Colors;
  iceServers?: RTCConfiguration['iceServers'];
}

export interface HallProps {
  open: boolean;
  locale: LocaleClient['hall'];
  server: string;
  roomId: string | number;
  userId: string | number;
  port: number;
}

export interface Stream {
  target: number | string;
  stream: MediaStream;
  connId: string;
  ref: React.Ref<HTMLVideoElement>;
}

export interface AlertProps {
  children: string;
  type: keyof typeof LogLevel;
  open: boolean;
}

export type ThemeType = 'light' | 'dark';
