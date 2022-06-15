/* eslint-disable no-case-declarations */
import dotenv from 'dotenv';
import { v4 } from 'uuid';
dotenv.config();
import { SERVER_PORT, APP_URL } from './utils/constants';
import { sendEmail } from './utils/email';
import WS from './core/ws';
import DB from './core/db';
import * as Types from './types/interfaces';
import { createToken, log } from './utils/lib';
import { auth } from './utils/auth';
import RTC from './core/rtc';

process.on('uncaughtException', (err: Error) => {
  log('error', 'uncaughtException', err);
});
process.on('unhandledRejection', (err: Error) => {
  log('error', 'unhandledRejection', err);
});

const wss = new WS({ port: SERVER_PORT });
const db = new DB();

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
    const { type, id, token, isAuth } = rawMessage;
    let authRes: string | null = null;
    let args;
    // TODO auth
    switch (type) {
      case Types.MessageType.GET_USER_ID:
        const { isRoom } = wss.getMessage(Types.MessageType.GET_USER_ID, rawMessage).data;
        // TODO fixed isRoom problem
        const { id: _id, token: _token } = isRoom
          ? { id, token: 'null' }
          : await db.getUserId(id, token);
        if (isRoom) {
          rtc.roomCons[connId] = id;
        }
        wss.setSocket({ id: _id, ws, connId, isRoom });
        rtc.createRTC({ id: _id });
        wss.sendMessage({
          type: Types.MessageType.SET_USER_ID,
          id: _id,
          token: _token ? _token : 'null',
          data: undefined,
        });
        break;
      case Types.MessageType.GET_GUEST_FIND_FIRST:
        args = wss.getMessage(Types.MessageType.GET_GUEST_FIND_FIRST, rawMessage).data.args;
        authRes = await auth({
          args,
          token,
          isAuth,
        });
        if (authRes !== null) {
          wss.sendMessage({
            type: Types.MessageType.SET_ERROR,
            id,
            token,
            data: {
              message: authRes,
            },
          });
          break;
        }
        wss.sendMessage({
          type: Types.MessageType.SET_GUEST_FIND_FIRST,
          id,
          token,
          data: {
            argv: await db.guestFindFirst(args),
          },
        });
        break;
      case Types.MessageType.GET_AUTH:
        const { email } = wss.getMessage(Types.MessageType.GET_AUTH, rawMessage).data;
        const date = new Date();
        const user = await db.guestUpdate({
          where: {
            id,
          },
          data: {
            lastLogin: date,
          },
          select: {
            lastLogin: true,
            lastVisit: true,
          },
        });
        if (user && user.lastLogin) {
          const __token = createToken({
            id,
            email,
            lastLogin: user.lastLogin.toISOString(),
            lastVisit: user.lastVisit.toISOString(),
          });
          await sendEmail({
            email,
            type: 'login',
            lang: 'en',
            link: `${APP_URL}?token=${__token}`,
          });
        }
        wss.sendMessage({
          type: Types.MessageType.SET_AUTH,
          id,
          token,
          data: {
            message: 'Email was send',
          },
        });
        break;
      case Types.MessageType.GET_GUEST_UPDATE:
        args = wss.getMessage(Types.MessageType.GET_GUEST_UPDATE, rawMessage).data.args;
        authRes = await auth<'Guest'>({
          args,
          token,
          selfUsage: {
            model: 'User',
            field: 'id',
            closedSelf: ['User'],
          },
        });
        if (authRes !== null) {
          wss.sendMessage({
            type: Types.MessageType.SET_ERROR,
            id,
            token,
            data: {
              message: authRes,
            },
          });
          break;
        }
        wss.sendMessage({
          type: Types.MessageType.SET_GUEST_UPDATE,
          id,
          token,
          data: {
            argv: await db.guestUpdate(args),
          },
        });
        break;
      case Types.MessageType.GET_ROOM:
        const { userId: uid } = wss.getMessage(Types.MessageType.GET_ROOM, rawMessage).data;
        if (!rtc.rooms[id]) {
          rtc.rooms[id] = [];
        }
        const conn = new wss.websocket(`ws://localhost:${SERVER_PORT}`);
        rtc.addUserToRoom({
          roomId: id,
          userId: uid,
        });
        // Send user list of room
        rtc.rooms[id].forEach((item) => {
          wss.sendMessage({
            type: Types.MessageType.SET_CHANGE_ROOM_GUESTS,
            id: item,
            token: '',
            data: {
              roomUsers: rtc.rooms[id],
            },
          });
        });
        conn.onopen = () => {
          conn.send(
            JSON.stringify({
              type: Types.MessageType.GET_USER_ID,
              id,
              data: {
                isRoom: true,
              },
            })
          );
          conn.onmessage = (mess) => {
            const msg = wss.parseMessage(mess.data as string);
            if (msg) {
              const { type } = msg;
              switch (type) {
                case Types.MessageType.OFFER:
                  const userId = wss.getMessage(Types.MessageType.OFFER, msg).data.userId;
                  const item = wss.getMessage(Types.MessageType.OFFER, msg).data.item;
                  if (item) {
                    rtc.createRTC({ id, item });
                  }
                  rtc.invite({ targetUserId: id, userId, item });
                  rtc.handleOfferMessage(msg);
                  break;
                case Types.MessageType.ANSWER:
                  rtc.handleVideoAnswerMsg(msg);
                  break;
                case Types.MessageType.CANDIDATE:
                  rtc.handleCandidateMessage(msg);
                  break;
              }
            }
          };
        };
        wss.sendMessage({
          type: Types.MessageType.SET_ROOM,
          id,
          token: 'null',
          data: undefined,
        });
        break;
      default:
        wss.sendMessage({
          type,
          token: 'null',
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
              token: '',
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
