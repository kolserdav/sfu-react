/******************************************************************************************
 * Repository: https://github.com/kolserdav/react-node-webrtc-sfu.git
 * File name: main.ts
 * Author: Sergey Kolmiller
 * Email: <uyem.ru@gmail.com>
 * License: MIT
 * License text:
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Thu Jul 14 2022 16:24:49 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/
/* eslint-disable no-case-declarations */
import { v4 } from 'uuid';
import dotenv from 'dotenv';
dotenv.config();
import WS from './core/ws';
import { MessageType } from './types/interfaces';
import { log } from './utils/lib';
import { PORT, DATABASE_URL } from './utils/constants';
import DB from './core/db';
import { RtcpHeader } from 'werift';

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
  const db = new DB({ ws: wss });

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
          await wss.setSocket({ id, ws, connId, isRoom: isRoom || false });
          if (!isRoom) {
            db.unitCreateOrUpdate({ userId: id.toString() });
          }
          wss.sendMessage({
            type: MessageType.SET_USER_ID,
            id,
            data: {
              roomUsers: isRoom ? db.rooms[id] : [],
            },
            connId,
          });
          break;
        case MessageType.GET_ROOM:
          db.handleGetRoomMessage({
            message: wss.getMessage(MessageType.GET_ROOM, rawMessage),
          });
          break;
        case MessageType.GET_ROOM_GUESTS:
          const _roomId = wss.getMessage(MessageType.GET_ROOM_GUESTS, rawMessage).data.roomId;
          wss.sendMessage({
            type: MessageType.SET_ROOM_GUESTS,
            id,
            data: {
              roomUsers: db.rooms[_roomId],
              muteds: db.muteds[_roomId],
            },
            connId,
          });
          break;
        case MessageType.GET_MUTE:
          const { muted, roomId } = wss.getMessage(MessageType.GET_MUTE, rawMessage).data;
          const index = db.muteds[roomId].indexOf(id.toString());
          if (muted) {
            if (index === -1) {
              db.muteds[roomId].push(id.toString());
            }
          } else {
            db.muteds[roomId].splice(index, 1);
          }
          db.rooms[roomId].forEach((item) => {
            wss.sendMessage({
              type: MessageType.SET_MUTE,
              id: item,
              connId: '',
              data: {
                muteds: db.muteds[roomId],
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
        const sock = item.split(db.delimiter);
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

        db.changeOnline({ userId, online: false });
        log('info', 'User disconnected', userId);
        const roomKeys = Object.keys(db.rooms);
        roomKeys.forEach((item) => {
          const index = db.rooms[item].indexOf(userId);
          if (index !== -1) {
            db.rooms[item].forEach((_item) => {
              if (_item !== userId) {
                wss.sendMessage({
                  type: MessageType.SET_CHANGE_UNIT,
                  id: _item,
                  data: {
                    roomLenght: db.rooms[item].length,
                    muteds: db.muteds[item],
                    target: userId,
                    eventName: 'delete',
                  },
                  connId: '',
                });
              }
            });
            db.rooms[item].splice(index, 1);
            const mute = db.muteds[item].indexOf(userId.toString());
            if (mute !== -1) {
              db.muteds[item].splice(mute, 1);
            }
            if (db.rooms[item].length === 0) {
              delete db.rooms[item];
              // set room is archive
              db.setRoomIsArchive({ roomId: item });
              delete db.muteds[item];
              db.closeRoom({ roomId: item });
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
  createServer({ port: PORT, cors: process.env.CORS, db: DATABASE_URL });
}
