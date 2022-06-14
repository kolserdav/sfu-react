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
    const rtc: RTC | null = new RTC({ roomId: id, ws: wss });
    // TODO auth
    switch (type) {
      case Types.MessageType.GET_USER_ID:
        const { isRoom } = wss.getMessage(Types.MessageType.GET_USER_ID, rawMessage).data;
        // TODO fixed isRoom problem
        const { id: _id, token: _token } = isRoom
          ? { id, token: '' }
          : await db.getUserId(id, token);
        wss.setSocket({ id: _id, ws, connId });
        wss.sendMessage({
          type: Types.MessageType.SET_USER_ID,
          id: _id,
          token: _token ? token : '',
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
          const conn = new wss.websocket(`ws://localhost:${SERVER_PORT}`);
          rtc.rooms[id] = [uid];
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
                    console.log('offer');
                    const userId = wss.getMessage(Types.MessageType.OFFER, msg).data.userId;
                    rtc.invite({ targetUserId: userId, userId: id });
                    rtc.handleOfferMessage(msg, () => {
                      console.log('cn');
                    });
                    break;
                  case Types.MessageType.ANSWER:
                    rtc.handleVideoAnswerMsg(msg, (e) => {
                      console.log('answer', e);
                    });
                    break;
                  case Types.MessageType.CANDIDATE:
                    rtc.handleCandidateMessage(msg, () => {
                      console.log('ice');
                    });
                    break;
                }
              }
            };
          };
        } else {
          rtc.addUserToRoom({
            roomId: id,
            userId: uid,
          });
        }
        wss.sendMessage({
          type: Types.MessageType.SET_ROOM,
          id,
          token: '',
          data: undefined,
        });
        break;
      default:
        wss.sendMessage({
          type,
          token: '',
          data: rawMessage.data,
          id,
        });
    }
  });
  ws.onclose = () => {
    const keys = Object.keys(wss.users);
    keys.forEach((item) => {
      const id = parseInt(item, 10);
      const connId = wss.users[id];
      if (wss.sockets[connId]) {
        delete wss.sockets[connId];
        delete wss.users[id];
      }
    });
  };
});
