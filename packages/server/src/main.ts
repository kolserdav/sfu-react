/******************************************************************************************
 * Repository: https://github.com/kolserdav/werift-sfu-react.git
 * File name: main.ts
 * Author: Sergey Kolmiller
 * Email: <uyem.ru@gmail.com>
 * License: MIT
 * License text: See in LICENSE file
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Wed Aug 24 2022 14:14:09 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/
/* eslint-disable import/first */
/* eslint-disable no-case-declarations */
import { v4 } from 'uuid';
import dotenv from 'dotenv';

dotenv.config();
import { PrismaClient } from '@prisma/client';
import WS from './core/ws';
import { ServerCallback } from './types';
import RTC, { OnRoomConnect, OnRoomOpen } from './core/rtc';
import { MessageType, LogLevel } from './types/interfaces';
import { cleanDbUrl, getLocale, log, setLogLevel } from './utils/lib';
import { PORT, CORS, CLOUD_DIR_PATH } from './utils/constants';
import DB from './core/db';
import Chat from './addons/chat';
import RecordVideo from './addons/recordVideo';
import Auth from './core/auth';
import Settings from './addons/settings';

export const prisma = new PrismaClient();

const db = new DB({ prisma });
const chat = new Chat({ prisma });

process.on('uncaughtException', (err: Error) => {
  log('error', 'uncaughtException', err);
});
process.on('unhandledRejection', (err: Error) => {
  if (err.name !== 'Error') {
    log('error', 'unhandledRejection', err);
  } else {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const _err: any = err;
    const turnError = _err?.response?.attributes[0];
    log(
      'error',
      err.message || turnError ? 'Turn error' : 'Unexpected error',
      turnError ? _err?.response?.attributes[0] : err
    );
  }
});
/**
 * Create WebRTC SFU server
 */
export function createServer(
  {
    port = PORT,
    cors = CORS,
    onRoomOpen,
    onRoomClose,
    onRoomConnect,
    onRoomDisconnect,
    checkTokenCb,
    cloudPath: _cloudPath,
    logLevel,
  }: {
    port?: number;
    cors?: string;
    onRoomOpen?: OnRoomOpen;
    // eslint-disable-next-line no-unused-vars
    onRoomClose?: (args: { roomId: string | number; roomLength: number; port: number }) => void;
    onRoomConnect?: OnRoomConnect;
    onRoomDisconnect?: OnRoomConnect;
    checkTokenCb?: Auth['checkTokenCb'];
    cloudPath?: string;
    logLevel?: LogLevel;
  },
  cb?: ServerCallback
) {
  if (require.main !== module) {
    log('info', 'Using DATABASE_URL:', cleanDbUrl(), true);
  }
  if (!_cloudPath) {
    log('warn', 'Cloud dir path "--cloud" is not set, video recording is not available', {
      _cloudPath,
    });
  }
  setLogLevel(logLevel);
  const cloudPath = _cloudPath || CLOUD_DIR_PATH;
  const wss = new WS({ port, cloudPath, prisma });
  const rtc: RTC | null = new RTC({ ws: wss, prisma });
  const settings = new Settings({ cloudPath, prisma });
  const recordVideo = new RecordVideo({
    settings,
    rtc,
    ws: wss,
    cloudPath,
    prisma,
  });

  settings.checkTokenCb = checkTokenCb || settings.checkTokenCb;
  chat.checkTokenCb = checkTokenCb || chat.checkTokenCb;
  recordVideo.checkTokenCb = checkTokenCb || recordVideo.checkTokenCb;
  wss.checkTokenCb = checkTokenCb || wss.checkTokenCb;

  const getConnectionId = (): string => {
    const connId = v4();
    if (wss.sockets[connId]) {
      return getConnectionId();
    }
    return connId;
  };
  wss.connection.on('connection', (ws, req) => {
    const { origin } = req.headers;
    const protocol = req.headers['sec-websocket-protocol'];
    const notAllowed = cors.split(',').indexOf(origin || '') === -1;
    const connId = getConnectionId();
    if (cors && notAllowed) {
      const message = 'Block CORS attempt';
      log('warn', message, { headers: req.headers });
      ws.send(
        JSON.stringify({
          type: MessageType.SET_ERROR,
          connId,
          data: {
            message,
            type: 'warn',
          },
        })
      );
      ws.close();
      return;
    }

    ws.on('message', async (message) => {
      let _data = '';
      if (typeof message !== 'string') {
        _data = message.toString('utf8');
      }
      const rawMessage = wss.parseMessage(_data);
      if (!rawMessage) {
        return;
      }
      const { type, id } = rawMessage;
      switch (type) {
        case MessageType.GET_USER_ID:
          const { isRoom, userName, locale } = wss.getMessage(
            MessageType.GET_USER_ID,
            rawMessage
          ).data;
          await wss.setSocket({ id, ws, connId, isRoom: isRoom || false, userName, locale });
          wss.sendMessage({
            type: MessageType.SET_USER_ID,
            id,
            data: {
              name: userName,
            },
            connId,
          });
          break;
        case MessageType.GET_ROOM:
          rtc.handleGetRoomMessage({
            message: wss.getMessage(MessageType.GET_ROOM, rawMessage),
            port,
            cors,
            onRoomConnect,
            onRoomOpen,
          });
          break;
        case MessageType.GET_CHAT_UNIT:
          chat.setUnit({
            roomId: wss.getMessage(MessageType.GET_CHAT_UNIT, rawMessage).id,
            userId: wss.getMessage(MessageType.GET_CHAT_UNIT, rawMessage).data.userId,
            ws,
            locale: wss.getMessage(MessageType.GET_CHAT_UNIT, rawMessage).data.locale,
            connId,
          });

          break;
        case MessageType.GET_SETTINGS_UNIT:
          settings.setUnit({
            roomId: wss.getMessage(MessageType.GET_SETTINGS_UNIT, rawMessage).id,
            userId: wss.getMessage(MessageType.GET_SETTINGS_UNIT, rawMessage).data.userId,
            ws,
            locale: wss.getMessage(MessageType.GET_SETTINGS_UNIT, rawMessage).data.locale,
            connId,
          });
          break;
        case MessageType.GET_CHAT_MESSAGES:
          chat.getChatMessages(rawMessage);
          break;
        case MessageType.GET_ROOM_GUESTS:
          const _roomId = wss.getMessage(MessageType.GET_ROOM_GUESTS, rawMessage).data.roomId;
          wss.sendMessage({
            type: MessageType.SET_ROOM_GUESTS,
            id,
            data: {
              roomUsers: rtc.rooms[_roomId],
              muteds: rtc.muteds[_roomId],
              adminMuteds: rtc.adminMuteds[_roomId],
              asked: rtc.askeds[_roomId],
              banneds: rtc.banneds[_roomId],
            },
            connId,
          });
          break;
        case MessageType.GET_CLOSE_PEER_CONNECTION:
          rtc.closePeerConnectionHandler(rawMessage);
          break;
        case MessageType.GET_ROOM_MESSAGE:
          chat.handleRoomMessage(rawMessage);
          break;
        case MessageType.GET_LOCALE:
          ws.send(
            JSON.stringify({
              type: MessageType.SET_LOCALE,
              data: {
                locale: getLocale(wss.getMessage(MessageType.GET_LOCALE, rawMessage).data.locale)
                  .client,
              },
            })
          );
          break;
        case MessageType.GET_EDIT_MESSAGE:
          chat.handleEditMessage(rawMessage);
          break;
        case MessageType.GET_CREATE_MESSAGE:
          chat.handleCreateMessage(rawMessage);
          break;
        case MessageType.GET_CREATE_QUOTE:
          chat.handleCreateQuote(rawMessage);
          break;
        case MessageType.GET_DELETE_MESSAGE:
          chat.handleDeleteMessage(rawMessage);
          break;
        case MessageType.GET_BLOCK_CHAT:
          chat.getBlockChatHandler(rawMessage);
          break;
        case MessageType.GET_TO_MUTE:
          rtc.getToMuteHandler(rawMessage);
          break;
        case MessageType.GET_TO_BAN:
          rtc.handleGetToBan(rawMessage);
          break;
        case MessageType.GET_TO_UNMUTE:
          rtc.handleGetToUnMute(rawMessage);
          break;
        case MessageType.GET_RECORD:
          recordVideo.handleVideoRecord(rawMessage);
          break;
        case MessageType.GET_VIDEO_DELETE:
          settings.videoDeleteHandler(rawMessage);
          break;
        case MessageType.GET_TO_UNBAN:
          rtc.handleGetToUnBan(rawMessage);
          break;
        case MessageType.GET_MUTE_FOR_ALL:
          rtc.getMuteForAllHandler(rawMessage);
          break;
        case MessageType.GET_MUTE:
          rtc.getMuteHandler(rawMessage);
          break;
        case MessageType.GET_VIDEO_FIND_MANY:
          settings.videoFindManyHandler(rawMessage);
          break;
        case MessageType.GET_ASK_FLOOR:
          rtc.setAskedFloorHandler(rawMessage);
          break;
        case MessageType.GET_VIDEO_TRACK:
          rtc.getVideoTrackHandler(rawMessage);
          break;
        case MessageType.GET_VIDEO_SETTINGS:
          recordVideo.getVideoSettingsHandler(rawMessage);
          break;
        case MessageType.GET_TO_ADMIN:
          rtc.getToAdminHandler(rawMessage);
          break;
        case MessageType.GET_VIDEO_FIND_FIRST:
          settings.videoFindFirstHandler(rawMessage);
          break;
        case MessageType.GET_VIDEO_UPDATE:
          settings.videoUpdateHandler(rawMessage);
          break;
        default:
          wss.sendMessage(rawMessage);
      }
    });

    const getUserId = (_connId: string) => {
      let userId = '';
      const keys = Object.keys(wss.sockets);
      keys.every((item) => {
        const sock = item.split(rtc.delimiter);
        if (sock[1] === _connId) {
          // eslint-disable-next-line prefer-destructuring
          userId = sock[0];
          return false;
        }
        return true;
      });
      return userId;
    };

    // eslint-disable-next-line no-param-reassign
    ws.on('close', async () => {
      let skip = false;
      if (protocol === 'chat') {
        Object.keys(chat.users).every((item) => {
          if (skip) {
            return false;
          }
          Object.keys(chat.users[item]).every((_item) => {
            if (chat.users[item][_item].connId === connId) {
              chat.cleanUnit({ roomId: item, userId: _item });
              skip = true;
              return false;
            }
            return true;
          });
          return true;
        });
      } else if (protocol === 'settings') {
        Object.keys(settings.users).every((item) => {
          if (skip) {
            return false;
          }
          Object.keys(settings.users[item]).every((_item) => {
            if (settings.users[item][_item].connId === connId) {
              settings.cleanUnit({ roomId: item, userId: _item });
              skip = true;
              return false;
            }
            return true;
          });
          return true;
        });
      }
      if (protocol !== 'room') {
        return;
      }
      const userId = getUserId(connId);
      if (userId) {
        const socketId = wss.getSocketId(userId, connId);
        if (wss.sockets[socketId]) {
          log('log', 'Delete socket', { userId, connId });
          delete wss.sockets[socketId];
        } else {
          log('warn', 'No socket delete', { s: Object.keys(wss.sockets) });
        }

        db.changeUserOnline({ userId, online: false });
        log('info', 'User disconnected', userId);

        const roomKeys = Object.keys(rtc.rooms);
        roomKeys.every((item) => {
          let index = -1;
          rtc.rooms[item].every((_item, i) => {
            if (_item.id.toString() === userId) {
              index = i;
              return false;
            }
            return true;
          });
          if (index !== -1) {
            rtc.rooms[item].splice(index, 1);
            if (onRoomDisconnect) {
              onRoomDisconnect({ roomId: item, userId, roomUsers: rtc.rooms[item] });
            }
            if (rtc.onRoomDisconnect) {
              rtc.onRoomDisconnect({ roomId: item, userId, roomUsers: rtc.rooms[item] });
            }
            // delete mute
            const mute = rtc.muteds[item].indexOf(userId);
            if (mute !== -1) {
              rtc.muteds[item].splice(mute, 1);
            }
            // delete offVideo
            const offVideo = rtc.offVideo[item].indexOf(userId);
            if (offVideo !== -1) {
              rtc.offVideo[item].splice(offVideo, 1);
            }
            // delete askeds
            const askeds = rtc.askeds[item].indexOf(userId);
            if (askeds !== -1) {
              rtc.askeds[item].splice(askeds, 1);
            }
            rtc.sendCloseMessages({ roomId: item, userId });
            rtc.cleanConnections(item, userId.toString());
            if (rtc.rooms[item].length === 0) {
              delete rtc.rooms[item];
              delete rtc.streams[item];
              delete rtc.banneds[item];
              delete rtc.askeds[item];
              delete rtc.muteForAll[item];
              delete rtc.offVideo[item];
              delete rtc.peerConnectionsServer[item];
              db.changeRoomArchive({ roomId: item.toString(), archive: true });
              delete rtc.muteds[item];
              delete rtc.adminMuteds[item];
              delete chat.users[item];
              delete chat.blocked[item];
              if (onRoomClose) {
                onRoomClose({ roomId: item, roomLength: rtc.getRoomLenght(), port });
              }
            }
            db.deleteGuest({ userId, roomId: item });
            delete wss.users[userId];
            return false;
          }
          return true;
        });
      }
    });
  });
  wss.connection.on('listening', () => {
    log('info', 'Uyem server listen at port:', port, true);
    if (cb) {
      cb(wss.connection);
    }
  });
}

if (require.main === module) {
  createServer({
    port: PORT,
    cors: CORS,
    cloudPath: CLOUD_DIR_PATH,
  });
}
