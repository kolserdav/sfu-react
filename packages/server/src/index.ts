/* eslint-disable no-case-declarations */
import dotenv from 'dotenv';
import { v4 } from 'uuid';
import { WebSocketServer } from 'ws';
import wrtc from 'wrtc';
dotenv.config();
import { getUserId, port } from './utils';
import WS from './core/ws';
import { MessageType } from './interfaces';

const wss = new WS({ port });

wss.connection.on('connection', function connection(ws) {
  ws.on('message', function message(data) {
    if (typeof data !== 'string') {
      return;
    }
    const rawMessage = wss.parseMessage(data);
    if (!rawMessage) {
      return;
    }
    const { type } = rawMessage;
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

  ws.send('something');
});
