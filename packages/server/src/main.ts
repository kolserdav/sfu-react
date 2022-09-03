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
import WS, { ServerCallback } from './core/ws';
import RTC, { OnRoomConnect, OnRoomOpen } from './core/rtc';
import { MessageType } from './types/interfaces';
import { getLocale, log } from './utils/lib';
import { PORT, CORS } from './utils/constants';
import DB from './core/db';
import Chat from './core/chat';

export const prisma = new PrismaClient();

const db = new DB();
const chat = new Chat();

process.on('uncaughtException', (err: Error) => {
  log('error', 'uncaughtException', err);
});
process.on('unhandledRejection', (err: Error) => {
  log('error', 'unhandledRejection', err);
});
/**
 * Create SFU WebRTC server
 */
export function createServer(
  {
    port = PORT,
    cors = CORS,
    onRoomOpen,
    onRoomClose,
    onRoomConnect,
    onRoomDisconnect,
  }: {
    port?: number;
    cors?: string;
    onRoomOpen?: OnRoomOpen;
    // eslint-disable-next-line no-unused-vars
    onRoomClose?: (args: { roomId: string | number }) => void;
    onRoomConnect?: OnRoomConnect;
    onRoomDisconnect?: OnRoomConnect;
  },
  cb?: ServerCallback
) {
  const wss = new WS({ port }, cb);
  const rtc: RTC | null = new RTC({ ws: wss });

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
          chat.setChatUnit({
            roomId: wss.getMessage(MessageType.GET_CHAT_UNIT, rawMessage).id,
            userId: wss.getMessage(MessageType.GET_CHAT_UNIT, rawMessage).data.userId,
            ws,
            locale: wss.getMessage(MessageType.GET_CHAT_UNIT, rawMessage).data.locale,
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
        case MessageType.GET_DELETE_MESSAGE:
          chat.handleDeleteMessage(rawMessage);
          break;
        case MessageType.GET_TO_MUTE:
          rtc.handleGetToMute(rawMessage);
          break;
        case MessageType.GET_TO_BAN:
          rtc.handleGetToBan(rawMessage);
          break;
        case MessageType.GET_TO_UNMUTE:
          rtc.handleGetToUnMute(rawMessage);
          break;
        case MessageType.GET_TO_UNBAN:
          rtc.handleGetToUnBan(rawMessage);
          break;
        case MessageType.GET_MUTE:
          rtc.handleGetMute(rawMessage);
          break;
        default:
          wss.sendMessage(rawMessage);
      }
    });

    const getUserId = (_connId: string) => {
      let userId: number | string = 0;
      const keys = Object.keys(wss.sockets);
      keys.forEach((item) => {
        const sock = item.split(rtc.delimiter);
        if (sock[1] === _connId) {
          // eslint-disable-next-line prefer-destructuring
          userId = sock[0];
        }
      });
      return userId;
    };

    // eslint-disable-next-line no-param-reassign
    ws.on('close', async () => {
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
        roomKeys.forEach((item) => {
          let index = -1;
          rtc.rooms[item].forEach((_item, i) => {
            if (_item.id === userId) {
              index = i;
            }
          });
          if (index !== -1) {
            chat.cleanChatUnit({ roomId: item, userId });
            const keys = rtc.getPeerConnectionKeys(item);
            rtc.cleanConnections(item, userId.toString());
            rtc.rooms[item].splice(index, 1);
            if (onRoomDisconnect) {
              onRoomDisconnect({ roomId: item, userId, roomUsers: rtc.rooms[item] });
            }
            const mute = rtc.muteds[item].indexOf(userId.toString());
            if (mute !== -1) {
              rtc.muteds[item].splice(mute, 1);
            }
            // Send user list of room
            rtc.rooms[item].forEach((_item) => {
              let _connId = connId;
              keys.forEach((i) => {
                const peer = i.split(rtc.delimiter);
                if (
                  (peer[1] === _item.id && peer[2] === userId.toString()) ||
                  (peer[1] === userId.toString() && peer[2] === _item.id)
                ) {
                  // eslint-disable-next-line prefer-destructuring
                  _connId = peer[3];
                }
              });
              wss.sendMessage({
                type: MessageType.SET_CHANGE_UNIT,
                id: _item.id,
                data: {
                  roomLength: rtc.rooms[item].length,
                  muteds: rtc.muteds[item],
                  adminMuteds: rtc.adminMuteds[item],
                  target: userId,
                  name: _item.name,
                  eventName: 'delete',
                  isOwner: _item.isOwner,
                },
                connId: _connId,
              });
            });
            if (rtc.rooms[item].length === 0) {
              if (onRoomClose) {
                onRoomClose({ roomId: item });
              }
              delete rtc.rooms[item];
              delete rtc.streams[item];
              delete rtc.peerConnectionsServer[item];
              db.changeRoomArchive({ userId: item.toString(), archive: true });
              delete rtc.muteds[item];
              delete rtc.adminMuteds[item];
            }
            db.deleteGuest({ userId, roomId: item });
            delete wss.users[userId];
          }
        });
      }
    });
  });
}

if (require.main === module) {
  createServer({ port: PORT, cors: CORS });
}
