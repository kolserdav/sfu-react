/* eslint-disable no-case-declarations */
import dotenv from 'dotenv';
import wrtc from 'wrtc';
dotenv.config();
import { getUserId, port, log } from './utils';
import WS from './core/ws';
import { MessageType } from './interfaces';

const wss = new WS({ port });

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
    console.log(type);
    switch (type) {
      case MessageType.USER_ID:
        const id = getUserId();
        wss.sockets[id] = ws;
        wss.sendMessage({
          type: MessageType.USER_KEY,
          data: {
            id,
          },
        });
        break;
      default:
    }
  });
});
