/******************************************************************************************
 * Repository: https://github.com/kolserdav/werift-sfu-react.git
 * File name: chat.ts
 * Author: Sergey Kolmiller
 * Email: <uyem.ru@gmail.com>
 * License: MIT
 * License text: See in LICENSE file
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Wed Aug 24 2022 14:14:09 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/
import { WebSocket } from 'ws';
import { ErrorCode, LocaleValue, MessageType, SendMessageArgs } from '../types/interfaces';
import { getLocale, log } from '../utils/lib';
import DB from './db';

class Chat extends DB {
  public users: Record<string, Record<string, { locale: LocaleValue; ws: WebSocket }>> = {};

  public setChatUnit({
    roomId,
    userId,
    ws,
    locale,
  }: {
    roomId: string | number;
    userId: string | number;
    ws: WebSocket;
    locale: LocaleValue;
  }) {
    if (!this.users[roomId]) {
      this.users[roomId] = {};
    }
    if (this.users[roomId][userId]) {
      log('warn', 'Duplicate chat user', { roomId, userId });
    }
    this.users[roomId][userId] = {
      locale,
      ws,
    };
    this.sendMessage({
      roomId,
      msg: {
        id: userId,
        connId: '',
        type: MessageType.SET_CHAT_UNIT,
        data: undefined,
      },
    });
  }

  public cleanChatUnit({ roomId, userId }: { roomId: string | number; userId: string | number }) {
    if (!this.users[roomId][userId]) {
      log('warn', 'Chat user can not remove', { roomId, userId });
      return;
    }
    delete this.users[roomId][userId];
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public sendMessage<T extends keyof typeof MessageType>({
    msg,
    roomId,
  }: {
    msg: SendMessageArgs<T>;
    roomId: string | number;
  }) {
    const { id } = msg;
    return new Promise((resolve) => {
      setTimeout(() => {
        let res = '';
        try {
          res = JSON.stringify(msg);
        } catch (e) {
          log('error', 'Error send chat message', e);
          resolve(1);
        }
        if (!this.users[roomId][id]) {
          log('error', 'Chat user not found', { roomId, id });
          resolve(1);
        }
        this.users[roomId][id].ws.send(res);
        resolve(0);
      }, 0);
    });
  }

  public async handleRoomMessage({
    id,
    connId,
    data: { userId, message },
  }: SendMessageArgs<MessageType.GET_ROOM_MESSAGE>) {
    const res = await this.messageCreate({
      data: {
        unitId: userId.toString(),
        roomId: id.toString(),
        text: message,
      },
      include: {
        Unit: {
          select: {
            name: true,
          },
        },
      },
    });
    const locale = getLocale(this.users[id][userId].locale).server;
    if (!res) {
      this.sendMessage({
        roomId: id,
        msg: {
          type: MessageType.SET_ERROR,
          connId,
          id: userId,
          data: {
            message: locale.errorSendMessage,
            type: 'error',
            code: ErrorCode.errorSendMessage,
          },
        },
      });
      return;
    }
    const uKeys = Object.keys(this.users[id]);
    uKeys.forEach((item) => {
      this.sendMessage({
        roomId: id,
        msg: {
          type: MessageType.SET_ROOM_MESSAGE,
          id: item,
          connId,
          data: res,
        },
      });
    });
  }

  public async handleEditMessage({
    id,
    data: { args, userId },
  }: SendMessageArgs<MessageType.GET_EDIT_MESSAGE>) {
    const res = await this.messageUpdate(args);
    const uKeys = Object.keys(this.users[id]);
    uKeys.forEach((item) => {
      this.sendMessage({
        roomId: id,
        msg: {
          type: MessageType.SET_EDIT_MESSAGE,
          connId: '',
          id: item,
          data: res,
        },
      });
    });
  }

  public async handleDeleteMessage({
    id,
    data: { args, userId },
  }: SendMessageArgs<MessageType.GET_DELETE_MESSAGE>) {
    const res = await this.messageDelete(args);
    const uKeys = Object.keys(this.users[id]);
    uKeys.forEach((item) => {
      this.sendMessage({
        roomId: id,
        msg: {
          type: MessageType.SET_DELETE_MESSAGE,
          connId: '',
          id: item,
          data: res,
        },
      });
    });
  }

  public async getChatMessages({
    id,
    data: { args, userId },
  }: SendMessageArgs<MessageType.GET_CHAT_MESSAGES>) {
    const data = await this.messageFindMany(args);
    this.sendMessage({
      roomId: id,
      msg: {
        type: MessageType.SET_CHAT_MESSAGES,
        connId: '',
        id: userId,
        data,
      },
    });
  }
}

export default Chat;
