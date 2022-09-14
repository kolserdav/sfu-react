/* eslint-disable no-unused-vars */
import { WebSocket, Server } from 'ws';
import { LocaleValue, SendMessageArgs, MessageType } from '../types/interfaces';
import DB from '../core/db';

export type WSItem = Record<string, Record<string, { locale: LocaleValue; ws: WebSocket }>>;

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

  public abstract sendMessage<T extends keyof typeof MessageType>(args: {
    msg: SendMessageArgs<T>;
    roomId: string | number;
  }): void;

  public abstract cleanUnit(args: { roomId: string | number; userId: string | number }): void;
}
