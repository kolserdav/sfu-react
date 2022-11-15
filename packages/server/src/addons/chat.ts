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
import { ConnectorInterface } from '../types';
import { ErrorCode, MessageType, SendMessageArgs } from '../types/interfaces';
import { getLocale, log } from '../utils/lib';
import DB from '../core/db';
import { IS_DEV } from '../utils/constants';

class Chat extends DB implements ConnectorInterface {
  public users: ConnectorInterface['users'] = {};

  public blocked: Record<string, (string | number)[]> = {};

  public setUnit: ConnectorInterface['setUnit'] = async ({
    roomId,
    userId,
    ws,
    locale,
    connId,
  }) => {
    if (!this.users[roomId]) {
      this.users[roomId] = {};
    }
    if (!this.blocked[roomId]) {
      this.blocked[roomId] = [];
    }
    const lang = getLocale(locale).server;
    if (this.users[roomId][userId] && !IS_DEV) {
      log('warn', 'Duplicate chat user', { roomId, userId });
      ws.send(
        JSON.stringify({
          type: MessageType.SET_ERROR,
          id: userId,
          connId,
          data: {
            type: 'warn',
            code: ErrorCode.duplicateTab,
            message: lang.duplicateTab,
          },
        })
      );
      return;
    }
    this.users[roomId][userId] = {
      locale,
      ws,
      connId,
    };
    this.sendMessage({
      roomId,
      msg: {
        id: userId,
        connId,
        type: MessageType.SET_CHAT_UNIT,
        data: undefined,
      },
    });
    this.sendMessage({
      roomId,
      msg: {
        id: userId,
        connId,
        type: MessageType.SET_BLOCK_CHAT,
        data: {
          target: 0,
          blocked: this.blocked[roomId],
        },
      },
    });
  };

  public cleanUnit: ConnectorInterface['cleanUnit'] = ({ roomId, userId }) => {
    if (!this.users[roomId][userId]) {
      log('warn', 'Chat user can not remove', { roomId, userId });
      return;
    }
    delete this.users[roomId][userId];
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public sendMessage: ConnectorInterface['sendMessage'] = ({ msg, roomId }) => {
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
  };

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
            id: true,
            name: true,
          },
        },
        Quote: {
          select: {
            MessageQuote: {
              include: {
                Unit: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
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
    data: { args },
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

  public async handleCreateMessage({
    id,
    data: { args },
  }: SendMessageArgs<MessageType.GET_CREATE_MESSAGE>) {
    const res = await this.messageCreate(args);
    const uKeys = Object.keys(this.users[id]);
    uKeys.forEach((item) => {
      this.sendMessage({
        roomId: id,
        msg: {
          type: MessageType.SET_CREATE_MESSAGE,
          connId: '',
          id: item,
          data: res,
        },
      });
    });
  }

  public getBlockChatHandler = ({
    id,
    data: { target, command },
  }: SendMessageArgs<MessageType.GET_BLOCK_CHAT>) => {
    let index = -1;
    switch (command) {
      case 'add':
        if (this.blocked[id].indexOf(target) === -1) {
          this.blocked[id].push(target);
        } else {
          log('warn', 'Duplicate block chat', { id, target });
        }
        break;
      case 'delete':
        index = this.blocked[id].indexOf(target);
        if (index !== -1) {
          this.blocked[id].splice(index, 1);
        } else {
          log('warn', 'Removed block chat is missing', { id, target });
        }
        break;
      default:
    }
    Object.keys(this.users[id]).forEach((item) => {
      this.sendMessage({
        msg: {
          type: MessageType.SET_BLOCK_CHAT,
          id: item,
          connId: '',
          data: {
            target,
            blocked: this.blocked[id],
          },
        },
        roomId: id,
      });
    });
  };

  public async handleCreateQuote({
    id,
    data: { args },
  }: SendMessageArgs<MessageType.GET_CREATE_QUOTE>) {
    const res = await this.quoteCreate(args);
    const uKeys = Object.keys(this.users[id]);
    uKeys.forEach((item) => {
      this.sendMessage({
        roomId: id,
        msg: {
          type: MessageType.SET_CREATE_QUOTE,
          connId: '',
          id: item,
          data: res,
        },
      });
    });
  }

  public async handleDeleteMessage({
    id,
    connId,
    data: { args, userId },
  }: SendMessageArgs<MessageType.GET_DELETE_MESSAGE>) {
    const res = await this.messageDelete(args);
    const lang = this.users[id][userId].locale;
    const locale = getLocale(lang).server;
    if (res === null) {
      this.sendMessage({
        roomId: id,
        msg: {
          id: userId,
          connId,
          type: MessageType.SET_ERROR,
          data: {
            type: 'error',
            message: locale.error,
            code: ErrorCode.errorDeleteMessage,
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
    connId,
    data: { args, userId },
  }: SendMessageArgs<MessageType.GET_CHAT_MESSAGES>) {
    const data = await this.messageFindMany(args);
    this.sendMessage({
      roomId: id,
      msg: {
        type: MessageType.SET_CHAT_MESSAGES,
        connId,
        id: userId,
        data,
      },
    });
  }
}

export default Chat;
