/* eslint-disable no-case-declarations */
import dotenv from 'dotenv';
import wrtc from 'wrtc';
dotenv.config();
import { getUserId } from './utils/lib';
import { SERVER_PORT } from './utils/constants';
import WS from './core/ws';
import DB from './core/db';
import * as Types from './types/interfaces';

const wss = new WS({ port: SERVER_PORT });
const db = new DB();

wss.connection.on('connection', function connection(ws) {
  ws.on('message', async function message(data) {
    let _data = '';
    if (typeof data !== 'string') {
      _data = data.toString('utf8');
    }
    const rawMessage = wss.parseMessage(_data);
    if (!rawMessage) {
      return;
    }
    const { type } = rawMessage;
    switch (type) {
      case Types.MessageType.GET_USER_ID:
        const { id: _id } = wss.getMessage(Types.MessageType.GET_USER_ID, rawMessage);
        const id = _id || getUserId();
        wss.setSocket({ id, ws });
        wss.sendMessage({
          type: Types.MessageType.SET_USER_ID,
          data: {
            id,
          },
        });
        break;
      case Types.MessageType.GET_USER_FINDFIRST:
        console.log(
          3323,
          rawMessage,
          wss.getMessage(Types.MessageType.GET_USER_FINDFIRST, rawMessage)
        );
        wss.sendMessage({
          type: Types.MessageType.SET_USER_FIND_FIRST,
          data: {
            argv: await db.userFindFirst(
              wss.getMessage(Types.MessageType.GET_USER_FINDFIRST, rawMessage.data).args
            ),
          },
        });
        break;
      case Types.MessageType.GET_USER_CREATE:
        console.log(32, rawMessage);
        wss.sendMessage({
          type: Types.MessageType.SET_USER_CREATE,
          data: {
            argv: await db.userCreate(
              wss.getMessage(Types.MessageType.GET_USER_CREATE, rawMessage).args
            ),
          },
        });
        break;
      default:
    }
  });
});
