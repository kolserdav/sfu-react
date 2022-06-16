/* eslint-disable no-case-declarations */
import { v4 } from 'uuid';
import { SERVER_PORT } from './utils/constants';
import WS from './core/ws';
import * as Types from './types/interfaces';
import { log, compareNumbers } from './utils/lib';
import RTC from './core/rtc';

process.on('uncaughtException', (err: Error) => {
  log('error', 'uncaughtException', err);
});
process.on('unhandledRejection', (err: Error) => {
  log('error', 'unhandledRejection', err);
});

const wss = new WS({ port: SERVER_PORT });

const getConnectionId = (): string => {
  const connId = v4();
  if (wss.sockets[connId]) {
    return getConnectionId();
  }
  return connId;
};

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
        });
        break;
      case Types.MessageType.GET_ROOM:
        rtc.handleGetRoomMessage({
          message: wss.getMessage(Types.MessageType.GET_ROOM, rawMessage),
        });
        break;
      default:
        wss.sendMessage({
          type,
          data: rawMessage.data,
          id,
        });
    }
  });
  ws.onclose = () => {
    // Get deleted userId
    let userId = 0;
    const keys = Object.keys(wss.users);
    keys.forEach((item) => {
      const id = parseInt(item, 10);
      const _connId = wss.users[id];
      if (wss.sockets[connId] && _connId === connId) {
        userId = id;
      }
    });
    // Remove user from room
    if (userId) {
      const roomKeys = Object.keys(rtc.rooms);
      roomKeys.forEach((item) => {
        const index = rtc.rooms[item].indexOf(userId);
        if (index !== -1 && connId === wss.users[userId]) {
          rtc.rooms[item].splice(index, 1);
          // Send user list of room
          rtc.rooms[item].forEach((_item) => {
            wss.sendMessage({
              type: Types.MessageType.SET_CHANGE_ROOM_GUESTS,
              id: _item,
              data: {
                roomUsers: rtc.rooms[item],
              },
            });
          });
        }
        delete wss.sockets[connId];
        delete wss.users[userId];
      });
    }
  };
});
