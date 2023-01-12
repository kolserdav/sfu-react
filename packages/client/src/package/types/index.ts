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
import { Video } from '@prisma/client';
import React from 'react';
import { Colors, Theme } from '../Theme';
import { LocaleServer, LogLevel } from './interfaces';

export type VideoFull = Video;

export interface GlobalProps {
  server: string;
  roomId: string | number;
  port: number;
  userId: string | number;
  name?: string;
  token?: string;
  theme?: Theme;
  /**
   * @deprecated NOT IMPLEMENTED
   */
  videoRecord?: boolean;
  iceServers?: RTCConfiguration['iceServers'];
  colors?: Colors;
  logLevel?: LogLevel;
  backLinks?: React.ReactNode | React.ReactNode[] | string | null;
}

export type RoomProps = GlobalProps & {
  locale: LocaleServer['client'];
};

export type HallProps = Required<
  Omit<GlobalProps, 'iceServers' | 'theme' | 'colors' | 'logLevel'>
> & {
  open: boolean;
  locale: LocaleServer['client'];
  theme?: Theme;
};

export type SettingsProps = Required<
  Omit<GlobalProps, 'iceServers' | 'theme' | 'colors' | 'logLevel' | 'backLinks'>
> & {
  open: boolean;
  locale: LocaleServer['client'];
  theme?: Theme;
};

export type ChatProps = Omit<HallProps, 'open' | 'backLinks' | 'videoRecord'>;

export interface Stream {
  target: number | string;
  name: string;
  isOwner: boolean;
  stream: MediaStream;
  connId: string;
  ref: React.Ref<HTMLVideoElement>;
  hidden?: boolean;
}

export interface AlertProps {
  children: string;
  type: keyof typeof LogLevel;
  open: boolean;
  theme?: Theme;
  infinity?: boolean;
}

export type DialogPropsDefaultContext = {
  id: string;
  unitId: string;
  text: string;
};

export type DialogPropsUsersContext = {
  unitId: string;
  isOwner: boolean;
};

export interface DialogProps<T> {
  open: boolean;
  children: React.ReactNode;
  clientX: number;
  clientY: number;
  width: number;
  height: number;
  context: T;
  secure?: boolean;
  theme?: Theme;
}

export interface DialogDeleteContext {
  id: string;
  name: string;
}

export type ThemeType = 'light' | 'dark';

export type ClickPosition = { clientX: number; clientY: number };

export type Volumes = Record<string, number>;

export type VideoRecorderState = 'start' | 'stop';
