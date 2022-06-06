/* eslint-disable no-case-declarations */
import dotenv from 'dotenv';
import wrtc from 'wrtc';
import { v4 } from 'uuid';
dotenv.config();
import { SERVER_PORT, APP_URL } from './utils/constants';
import { sendEmail } from './utils/email';
import WS from './core/ws';
import DB from './core/db';
import * as Types from './types/interfaces';
import { createToken, log } from './utils/lib';
import { auth } from './utils/auth';

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
  ws.on('message', async function message(data) {
    let _data = '';
    if (typeof data !== 'string') {
      _data = data.toString('utf8');
    }
    const rawMessage = wss.parseMessage(_data);
    if (!rawMessage) {
      return;
    }
    const { type, id, token } = rawMessage;
    let authRes: string | null = null;
    let args;
    // TODO auth
    switch (type) {
      case Types.MessageType.GET_USER_ID:
        const { id: _id, token: _token } = await db.getUserId(id, token);
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
        const __token = createToken({
          id,
          email,
        });
        await sendEmail({
          email,
          type: 'login',
          lang: 'en',
          link: `${APP_URL}?token=${__token}`,
        });
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
      default:
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
