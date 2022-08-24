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

interface GlobalProps {
  server: string;
  roomId: string | number;
  port: number;
  userId: string | number;
  name?: string;
}

export type RoomProps = GlobalProps & {
  iceServers?: RTCConfiguration['iceServers'];
  locale: LocaleClient;
  colors?: Colors;
};

export type HallProps = GlobalProps & {
  open: boolean;
  locale: LocaleClient;
};

export type ChatProps = Omit<HallProps, 'open'>;

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

export interface DialogProps {
  open: boolean;
  children: React.ReactNode;
  clientX: number;
  clientY: number;
  context: number;
}

export type ThemeType = 'light' | 'dark';

export type ClickPosition = Omit<DialogProps, 'open' | 'children'>;
