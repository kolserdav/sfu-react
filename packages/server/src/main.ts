/******************************************************************************************
 * Repository: https://github.com/kolserdav/react-node-webrtc-sfu.git
 * File name: main.ts
 * Author: Sergey Kolmiller
 * Email: <uyem.ru@gmail.com>
 * License: BSD-2-Clause
 * License text: Binary distributions of this software include 'wrtc' and other third-party libraries.
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Mon Jul 04 2022 10:58:51 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/
/* eslint-disable no-case-declarations */
import { v4 } from 'uuid';
import dotenv from 'dotenv';
dotenv.config();
import WS from './core/ws';
import RTC from './core/rtc';
import { MessageType } from './types/interfaces';
import { log } from './utils/lib';
import { PORT, DATABASE_URL } from './utils/constants';
import DB from './core/db';

const db = new DB();

process.on('uncaughtException', (err: Error) => {
  log('error', 'uncaughtException', err);
});
process.on('unhandledRejection', (err: Error) => {
  log('error', 'unhandledRejection', err);
});

/**
 * Create SFU WebRTC server
 */
function createServer({ port = PORT, cors = '' }: { port?: number; cors?: string; db?: string }) {
  log('info', 'Server listen at port:', port, true);
  const getConnectionId = (): string => {
    const connId = v4();
    if (wss.sockets[connId]) {
      return getConnectionId();
    }
    return connId;
  };

  const wss = new WS({ port });
  const rtc: RTC | null = new RTC({ ws: wss });

  wss.connection.on('connection', function connection(ws, req) {
    const { origin } = req.headers;
    const notAllowed = cors.split(',').indexOf(origin || '') === -1;
    if (cors && notAllowed) {
      ws.close();
      log('warn', 'Block CORS attempt', { headers: req.headers });
      return;
    }
    const connId = getConnectionId();
    ws.on('message', async function message(message) {
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
          const { isRoom } = wss.getMessage(MessageType.GET_USER_ID, rawMessage).data;
          await wss.setSocket({ id, ws, connId, isRoom });
          wss.sendMessage({
            type: MessageType.SET_USER_ID,
            id,
            data: {
              userId: isRoom
                ? rtc.rooms[Object.keys(rtc.rooms).find((item) => item === id.toString()) || 0][0]
                : id,
            },
            connId,
          });
          break;
        case MessageType.GET_ROOM:
          rtc.handleGetRoomMessage({
            message: wss.getMessage(MessageType.GET_ROOM, rawMessage),
          });
          break;
        case MessageType.GET_ROOM_GUESTS:
          const _roomId = wss.getMessage(MessageType.GET_ROOM_GUESTS, rawMessage).data.roomId;
          /*
          wss.sendMessage({
            type: MessageType.SET_ROOM_GUESTS,
            id,
            data: {
              roomUsers: rtc.rooms[_roomId],
              muteds: rtc.muteds[_roomId],
            },
            connId,
          });
          */
          break;
        case MessageType.GET_MUTE:
          const { muted, roomId } = wss.getMessage(MessageType.GET_MUTE, rawMessage).data;
          const index = rtc.muteds[roomId].indexOf(id.toString());
          if (muted) {
            if (index === -1) {
              rtc.muteds[roomId].push(id.toString());
            }
          } else {
            rtc.muteds[roomId].splice(index, 1);
          }
          rtc.rooms[roomId].forEach((item) => {
            wss.sendMessage({
              type: MessageType.SET_MUTE,
              id: item,
              connId: '',
              data: {
                muteds: rtc.muteds[roomId],
              },
            });
          });
          break;
        default:
          wss.sendMessage(rawMessage);
      }
    });

    const getUserId = () => {
      let userId: number | string = 0;
      const keys = Object.keys(wss.sockets);
      keys.forEach((item) => {
        const sock = item.split(rtc.delimiter);
        if (sock[1] === connId) {
          userId = sock[0];
        }
      });
      return userId;
    };

    // Remove user from room
    ws.onclose = async () => {
      const userId = getUserId();
      if (userId) {
        const socketId = wss.getSocketId(userId, connId);
        if (wss.sockets[socketId]) {
          log('log', 'Delete socket', { userId, connId });
          delete wss.sockets[socketId];
        } else {
          log('warn', 'No socket delete', { s: Object.keys(wss.sockets) });
        }
        // set unit offline
        db.unitFindFirst({
          where: {
            id: userId.toString(),
          },
        }).then((d) => {
          if (d) {
            db.unitUpdate({
              where: {
                id: userId.toString(),
              },
              data: {
                online: false,
                updated: new Date(),
              },
            });
          }
        });
        log('info', 'User disconnected', userId);
        const roomKeys = Object.keys(rtc.rooms);
        roomKeys.forEach((item) => {
          const index = rtc.rooms[item].indexOf(userId);
          if (index !== -1) {
            rtc.rooms[item].splice(index, 1);
            const mute = rtc.muteds[item].indexOf(userId.toString());
            if (mute !== -1) {
              rtc.muteds[item].splice(mute, 1);
            }
            // Send user list of room
            rtc.rooms[item].forEach((_item) => {
              wss.sendMessage({
                type: MessageType.SET_CHANGE_UNIT,
                id: _item,
                data: {
                  roomLenght: rtc.rooms[item].length,
                  muteds: rtc.muteds[item],
                  target: userId,
                  eventName: 'delete',
                },
                connId: connId,
              });
            });
            if (rtc.rooms[item].length === 1 && rtc.rooms[item][0] === item) {
              delete rtc.rooms[item];
              db.roomUpdate({
                where: {
                  id: item.toString(),
                },
                data: {
                  archive: true,
                  updated: new Date(),
                },
              });
              delete rtc.muteds[item];
              rtc.pages[item]
                ?.close()
                .then(() => {
                  delete rtc.pages[item];
                })
                .catch(() => {
                  delete rtc.pages[item];
                });
            }
            db.deleteGuest({ userId, roomId: item });
            delete wss.users[userId];
          }
        });
      }
    };
  });
}

export default createServer;

if (require.main === module) {
  createServer({ port: PORT, cors: 'http://localhost:3000', db: DATABASE_URL });
}
