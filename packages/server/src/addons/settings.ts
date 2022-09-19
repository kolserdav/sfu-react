// eslint-disable-next-line max-classes-per-file
import { ConnectorInterface } from '../types';
import { MessageType, SendMessageArgs, ErrorCode } from '../types/interfaces';
import { log, getLocale } from '../utils/lib';
import DB from '../core/db';

class Settings extends DB implements ConnectorInterface {
  public users: ConnectorInterface['users'] = {};

  public setUnit: ConnectorInterface['setUnit'] = ({ roomId, userId, ws, locale, connId }) => {
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
        connId,
        type: MessageType.SET_SETTINGS_UNIT,
        data: undefined,
      },
    });
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public sendMessage: ConnectorInterface['sendMessage'] = ({ msg, roomId }, cb) => {
    const { id } = msg;
    return new Promise((resolve) => {
      setTimeout(() => {
        let res = '';
        try {
          res = JSON.stringify(msg);
        } catch (e) {
          log('error', 'Error send settings message', e);
          resolve(1);
        }
        if (!this.users[roomId][id]) {
          log('error', 'Settings user not found', { roomId, id });
          resolve(1);
        }
        this.users[roomId][id].ws.send(res, cb);
        resolve(0);
      }, 0);
    });
  };

  public cleanUnit: ConnectorInterface['cleanUnit'] = ({ roomId, userId }) => {
    if (!this.users[roomId][userId]) {
      log('warn', 'Settings user can not remove', { roomId, userId });
      return;
    }
    delete this.users[roomId][userId];
  };

  public async videoFindManyHandler({
    id,
    data: { args, userId, token },
    connId,
  }: SendMessageArgs<MessageType.GET_VIDEO_FIND_MANY>) {
    const locale = getLocale(this.users[id][userId].locale).server;
    if ((await this.checkTokenCb(token)) === false) {
      this.sendMessage({
        roomId: id,
        msg: {
          type: MessageType.SET_ERROR,
          connId,
          id: userId,
          data: {
            type: 'warn',
            message: locale.forbidden,
            code: ErrorCode.forbidden,
          },
        },
      });
      return;
    }
    const videos = await this.videoFindMany({ ...args });
    this.sendMessage({
      roomId: id,
      msg: {
        type: MessageType.SET_VIDEO_FIND_MANY,
        id: userId,
        connId,
        data: {
          videos,
        },
      },
    });
  }

  public async videoFindFirstHandler({
    id,
    data: { args, userId, token },
    connId,
  }: SendMessageArgs<MessageType.GET_VIDEO_FIND_MANY>) {
    const locale = getLocale(this.users[id][userId].locale).server;
    if ((await this.checkTokenCb(token)) === false) {
      this.sendMessage({
        roomId: id,
        msg: {
          type: MessageType.SET_ERROR,
          connId,
          id: userId,
          data: {
            type: 'warn',
            message: locale.forbidden,
            code: ErrorCode.forbidden,
          },
        },
      });
      return;
    }
    const video = await this.videoFindFirst({ ...args });
    this.sendMessage({
      roomId: id,
      msg: {
        type: MessageType.SET_VIDEO_FIND_FIRST,
        id: userId,
        connId,
        data: {
          video,
        },
      },
    });
  }
}

export default Settings;
