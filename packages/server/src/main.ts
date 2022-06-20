/******************************************************************************************
 * Repository: https://github.com/kolserdav/uyem.git
 * File name: main.ts
 * Author: Sergey Kolmiller
 * Email: <uyem.ru@gmail.com>
 * License: BSD-2-Clause
 * License text: Binary distributions of this software include WebRTC and other third-party libraries.
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Sun Jun 19 2022 01:46:25 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/
/* eslint-disable no-case-declarations */
import { v4 } from 'uuid';
import WS from './core/ws';
import RTC from './core/rtc';
import * as Types from './types/interfaces';
import { log } from './utils/lib';
import { PORT } from './utils/constants';

process.on('uncaughtException', (err: Error) => {
  log('error', 'uncaughtException', err);
});
process.on('unhandledRejection', (err: Error) => {
  log('error', 'unhandledRejection', err);
});

/**
 * Create SFU WebRTC server
 */
function createServer({ port = PORT }: { port?: number }) {
  log('info', 'Server listen at port:', port);
  const getConnectionId = (): string => {
    const connId = v4();
    if (wss.sockets[connId]) {
      return getConnectionId();
    }
    return connId;
  };

  const wss = new WS({ port });
  const rtc: RTC | null = new RTC({ ws: wss });

  wss.connection.on('connection', function connection(ws) {
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
        case Types.MessageType.GET_USER_ID:
          const { isRoom } = wss.getMessage(Types.MessageType.GET_USER_ID, rawMessage).data;
          // TODO fixed isRoom problem
          if (isRoom) {
            rtc.roomCons[connId] = id;
          }
          wss.setSocket({ id, ws, connId, isRoom });
          wss.sendMessage({
            type: Types.MessageType.SET_USER_ID,
            id,
            data: undefined,
            connId,
          });
          break;
        case Types.MessageType.GET_ROOM:
          rtc.handleGetRoomMessage({
            message: wss.getMessage(Types.MessageType.GET_ROOM, rawMessage),
            port,
          });
          break;
        case Types.MessageType.GET_CHANGE_ROOM_GUESTS:
          wss.sendMessage({
            type: Types.MessageType.SET_CHANGE_ROOM_GUESTS,
            id,
            data: {
              roomUsers:
                rtc.rooms[
                  wss.getMessage(Types.MessageType.GET_CHANGE_ROOM_GUESTS, rawMessage).data.roomId
                ],
            },
            connId,
          });
          break;
        default:
          wss.sendMessage(rawMessage);
      }
    });

    ws.onclose = () => {
      // Get deleted userId
      let userId: number | string = 0;
      const keys = Object.keys(wss.users);
      keys.forEach((item) => {
        const _connId = wss.users[item];
        if (wss.sockets[connId] && _connId === connId) {
          userId = item;
        }
      });
      // Remove user from room
      if (userId) {
        const roomKeys = Object.keys(rtc.rooms);
        roomKeys.forEach((item) => {
          const index = rtc.rooms[item].indexOf(userId);
          if (index !== -1) {
            rtc.cleanConnections(item, userId.toString());
            rtc.rooms[item].splice(index, 1);
            // Send user list of room
            rtc.rooms[item].forEach((_item) => {
              log('info', 'Needed delete user', {
                _item,
                d: Object.keys(rtc.peerConnections),
                connId,
                userId,
                c: wss.users[userId],
              });
              wss.sendMessage({
                type: Types.MessageType.SET_CHANGE_ROOM_GUESTS,
                id: _item,
                data: {
                  roomUsers: rtc.rooms[item],
                },
                connId,
              });
            });
          }
          delete wss.sockets[connId];
          delete wss.users[userId];
        });
      }
    };
  });
}
export default createServer;

if (require.main === module) {
  createServer({ port: PORT });
}
