/******************************************************************************************
 * Repository: https://github.com/kolserdav/werift-sfu-react.git
 * File name: index.ts
 * Author: Sergey Kolmiller
 * Email: <uyem.ru@gmail.com>
 * License: MIT
 * License text: See in LICENSE file
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Fri Jul 29 2022 21:35:51 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/
import { Colors } from '../Theme';
import { LocaleClient } from './interfaces';

export interface RoomProps {
  id: number | string;
  server: string;
  port: number;
  locale: LocaleClient['room'];
  colors?: Colors;
  iceServers?: RTCConfiguration['iceServers'];
}

export interface HallProps {
  open: boolean;
  locale: LocaleClient['hall'];
}

export interface Stream {
  target: number | string;
  stream: MediaStream;
  connId: string;
  ref: React.Ref<HTMLVideoElement>;
}

export type ThemeType = 'light' | 'dark';
