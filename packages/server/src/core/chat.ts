import { WebSocket } from 'ws';
import { MessageType, SendMessageArgs } from '../types/interfaces';
import { log } from '../utils/lib';
import DB from './db';

class Chat extends DB {
  public users: Record<string, Record<string, WebSocket>> = {};

  public setChatUnit({
    roomId,
    userId,
    ws,
  }: {
    roomId: string | number;
    userId: string | number;
    ws: WebSocket;
  }) {
    if (!this.users[roomId]) {
      this.users[roomId] = {};
    }
    if (this.users[roomId][userId]) {
      log('warn', 'Duplicate chat user', { roomId, userId });
    } else {
      this.users[roomId][userId] = ws;
    }
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
        this.users[roomId][id].send(res);
        resolve(0);
      }, 0);
    });
  }

  public async handleRoomMessage({
    id,
    connId,
    data: { userId, message },
  }: SendMessageArgs<MessageType.SET_ROOM_MESSAGE>) {
    const res = await this.messageCreate({
      data: {
        unitId: userId.toString(),
        roomId: id.toString(),
        text: message,
      },
    });
    if (!res) {
      this.sendMessage({
        roomId: id,
        msg: {
          type: MessageType.SET_ERROR,
          connId,
          id: userId,
          data: {
            message: 'Error send message',
            context: {
              type: MessageType.SET_ROOM_MESSAGE,
              connId,
              id,
              data: {},
            },
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
          data: {
            message,
            userId,
          },
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
