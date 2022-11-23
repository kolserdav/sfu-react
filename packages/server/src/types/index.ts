/******************************************************************************************
 * Repository: https://github.com/kolserdav/werift-sfu-react.git
 * File name: index.ts
 * Author: Sergey Kolmiller
 * Email: <uyem.ru@gmail.com>
 * License: MIT
 * License text: See in LICENSE file
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Wed Nov 23 2022 15:23:26 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/
/* eslint-disable no-unused-vars */
import { WebSocket, Server } from 'ws';
import { LocaleValue, SendMessageArgs, MessageType } from '../types/interfaces';
import DB from '../core/db';

export type WSItem = Record<
  string,
  Record<string, { locale: LocaleValue; ws: WebSocket; connId: string }>
>;

export type ServerCallback = (args: Server<WebSocket>) => void;

// eslint-disable-next-line import/prefer-default-export
export abstract class ConnectorInterface extends DB {
  public abstract users: WSItem;

  public abstract setUnit(args: {
    roomId: string | number;
    userId: string | number;
    ws: WebSocket;
    locale: LocaleValue;
    connId: string;
  }): void;

  public abstract sendMessage<T extends keyof typeof MessageType>(
    args: {
      msg: SendMessageArgs<T>;
      roomId: string | number;
    },
    cb?: () => void
  ): void;

  public abstract cleanUnit(args: { roomId: string | number; userId: string | number }): void;
}
