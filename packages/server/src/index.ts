/* eslint-disable no-case-declarations */
import dotenv from 'dotenv';
import wrtc from 'wrtc';
dotenv.config();
import { getUserId } from './utils/lib';
import { SERVER_PORT } from './utils/constants';
import WS from './core/ws';
import { MessageType } from './interfaces';

const wss = new WS({ port: SERVER_PORT });

wss.connection.on('connection', function connection(ws) {
  ws.on('message', function message(data) {
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
      case MessageType.USER_ID:
        const id = getUserId();
        wss.setSocket({ id, ws });
        wss.sendMessage({
          id,
          type: MessageType.USER_KEY,
        });
        break;
      default:
    }
  });
});
