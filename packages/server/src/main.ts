/* eslint-disable no-case-declarations */
import { v4 } from 'uuid';
import WS from './core/ws';
import RTC from './core/rtc';
import * as Types from './types/interfaces';

/**
 * julia-teams server
 */
function Server({ port }: { port: number }) {
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
          if (index !== -1 && connId === wss.users[userId]) {
            rtc.closeVideoCall({ roomId: item, userId, target: 0, connId });
            rtc.rooms[item].splice(index, 1);
            // Send user list of room
            rtc.rooms[item].forEach((_item) => {
              rtc.closeVideoCall({ roomId: item, userId, target: _item, connId });
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
}
export default Server;
