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
import { Colors, Theme } from '../Theme';
import { LocaleServer, LogLevel } from './interfaces';

interface GlobalProps {
  server: string;
  roomId: string | number;
  port: number;
  userId: string | number;
  name?: string;
  theme?: Theme;
  iceServers?: RTCConfiguration['iceServers'];
}

export type RoomProps = GlobalProps & {
  locale: LocaleServer['client'];
  colors?: Colors;
};

export type HallProps = Omit<GlobalProps, 'iceServers'> & {
  open: boolean;
  locale: LocaleServer['client'];
};

export type ChatProps = Omit<HallProps, 'open'>;

export interface Stream {
  target: number | string;
  name: string;
  stream: MediaStream;
  connId: string;
  ref: React.Ref<HTMLVideoElement>;
}

export interface AlertProps {
  children: string;
  type: keyof typeof LogLevel;
  open: boolean;
  theme?: Theme;
}

export interface DialogProps {
  open: boolean;
  children: React.ReactNode;
  clientX: number;
  clientY: number;
  width: number;
  height: number;
  context: string;
  secure?: boolean;
  theme?: Theme;
}

export type ThemeType = 'light' | 'dark';

export type ClickPosition = { clientX: number; clientY: number };

export type Volumes = Record<string, number>;
