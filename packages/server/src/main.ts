/******************************************************************************************
 * Repository: https://github.com/kolserdav/uyem.git
 * File name: main.ts
 * Author: Sergey Kolmiller
 * Email: <uyem.ru@gmail.com>
 * License: BSD-2-Clause
 * License text: Binary distributions of this software include 'wrtc' and other third-party libraries.
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Tue Jun 21 2022 08:50:18 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/
/* eslint-disable no-case-declarations */
import { v4 } from 'uuid';
import WS from './core/ws';
import RTC from './core/rtc';
import { MessageType } from './types/interfaces';
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
        case MessageType.GET_USER_ID:
          const { isRoom } = wss.getMessage(MessageType.GET_USER_ID, rawMessage).data;
          // TODO fixed isRoom problem
          if (isRoom) {
            rtc.roomCons[connId] = id;
          }
          wss.setSocket({ id, ws, connId, isRoom });
          wss.sendMessage({
            type: MessageType.SET_USER_ID,
            id,
            data: undefined,
            connId,
          });
          break;
        case MessageType.GET_ROOM:
          rtc.handleGetRoomMessage({
            message: wss.getMessage(MessageType.GET_ROOM, rawMessage),
            port,
          });
          break;
        case MessageType.GET_ROOM_GUESTS:
          wss.sendMessage({
            type: MessageType.SET_ROOM_GUESTS,
            id,
            data: {
              roomUsers:
                rtc.rooms[wss.getMessage(MessageType.GET_ROOM_GUESTS, rawMessage).data.roomId],
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
            const keys = Object.keys(rtc.peerConnections);
            rtc.cleanConnections(item, userId.toString());
            rtc.rooms[item].splice(index, 1);
            // Send user list of room
            rtc.rooms[item].forEach((_item) => {
              let _connId = connId;
              keys.forEach((i) => {
                const peer = i.split(rtc.delimiter);
                if (
                  (peer[1] === _item && peer[2] === userId) ||
                  (peer[1] === userId && peer[2] === _item)
                ) {
                  _connId = peer[3];
                }
              });
              log('info', 'Needed delete user', {
                _item,
                d: keys,
                connId,
                userId,
                c: wss.users[userId],
                _connId,
              });
              wss.sendMessage({
                type: MessageType.SET_CHANGE_UNIT,
                id: _item,
                data: {
                  roomLenght: rtc.rooms[item].length,
                  target: userId,
                  eventName: 'delete',
                },
                connId: _connId,
              });
            });
            if (rtc.rooms[item].length === 0) {
              delete rtc.rooms[item];
            }
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
