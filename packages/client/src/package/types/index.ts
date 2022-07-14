/******************************************************************************************
 * Repository: https://github.com/kolserdav/react-node-webrtc-sfu.git
 * File name: index.ts
 * Author: Sergey Kolmiller
 * Email: <uyem.ru@gmail.com>
 * License: MIT
 * License text: 
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Thu Jul 14 2022 16:24:49 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/
import { Colors } from '../Theme';

export interface RoomProps {
  id: number | string;
  server: string;
  port: number;
  colors?: Colors;
  iceServers?: RTCConfiguration['iceServers'];
}

export interface Stream {
  target: number | string;
  stream: MediaStream;
  connId: string;
  ref: React.Ref<HTMLVideoElement>;
}

export type ThemeType = 'light' | 'dark';
