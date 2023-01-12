/******************************************************************************************
 * Repository: https://github.com/kolserdav/werift-sfu-react.git
 * File name: settings.ts
 * Author: Sergey Kolmiller
 * Email: <uyem.ru@gmail.com>
 * License: MIT
 * License text: See in LICENSE file
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Wed Nov 23 2022 15:23:26 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/
// eslint-disable-next-line max-classes-per-file
import { ConnectorInterface } from '../types';
import { MessageType, SendMessageArgs, ErrorCode } from '../types/interfaces';
import { log, getLocale } from '../utils/lib';
import DB from '../core/db';
import { AUTH_UNIT_ID_DEFAULT } from '../utils/constants';

class Settings extends DB implements ConnectorInterface {
  public users: ConnectorInterface['users'] = {};

  constructor({ prisma }: { prisma: DB['prisma'] }) {
    super({ prisma });
  }

  public setUnit: ConnectorInterface['setUnit'] = ({ roomId, userId, ws, locale, connId }) => {
    if (!this.users[roomId]) {
      this.users[roomId] = {};
    }
    if (this.users[roomId][userId]) {
      log('warn', 'Duplicate settings user', { roomId, userId });
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
          log('warn', 'Settings user not found', { roomId, id });
          resolve(1);
          return;
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
    const { errorCode, unitId } = await this.checkTokenCb({ token });
    const isDefault = unitId === AUTH_UNIT_ID_DEFAULT;
    if (errorCode !== 0 && !isDefault) {
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
    if (!isDefault && userId.toString() !== unitId) {
      this.sendMessage({
        roomId: id,
        msg: {
          type: MessageType.SET_ERROR,
          connId,
          id: userId,
          data: {
            type: 'warn',
            message: locale.notAuthorised,
            code: ErrorCode.notAuthorised,
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
    const { errorCode, unitId } = await this.checkTokenCb({ token });
    const isDefault = unitId === AUTH_UNIT_ID_DEFAULT;
    if (errorCode !== 0 && !isDefault) {
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
    if (!isDefault && userId.toString() !== unitId) {
      this.sendMessage({
        roomId: id,
        msg: {
          type: MessageType.SET_ERROR,
          connId,
          id: userId,
          data: {
            type: 'warn',
            message: locale.notAuthorised,
            code: ErrorCode.notAuthorised,
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

  public async videoDeleteHandler({
    id,
    data: { args, userId, token },
    connId,
  }: SendMessageArgs<MessageType.GET_VIDEO_DELETE>) {
    const locale = getLocale(this.users[id][userId].locale).server;
    const { errorCode, unitId } = await this.checkTokenCb({ token });
    const isDefault = unitId === AUTH_UNIT_ID_DEFAULT;
    if (errorCode !== 0 && !isDefault) {
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
    if (!isDefault && userId.toString() !== unitId) {
      this.sendMessage({
        roomId: id,
        msg: {
          type: MessageType.SET_ERROR,
          connId,
          id: userId,
          data: {
            type: 'warn',
            message: locale.notAuthorised,
            code: ErrorCode.notAuthorised,
          },
        },
      });
      return;
    }
    const video = await this.videoDelete({ ...args });
    this.sendMessage({
      roomId: id,
      msg: {
        type: MessageType.SET_VIDEO_DELETE,
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
