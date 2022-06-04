import dotenv from 'dotenv';
import { v4 } from 'uuid';
import { WebSocketServer } from 'ws';
import wrtc from 'wrtc';
dotenv.config();
import { port } from './utils';
import WS from './core/ws';
import { MessageType } from './interfaces';

const wss = new WS({ port });

wss.connection.on('connection', function connection(ws) {
  const key = v4();
  wss.sockets[key] = ws;
  wss.sendMessage({
    type: MessageType.USER_KEY,
    data: {
      key,
    },
  });
  ws.on('message', function message(data) {
    console.log('received: %s', data);
    const rawMessage = wss.parseMessage(data);
    const message = wss.getMessage<MessageType.USER_ID>(rawMessage);
  });

  ws.send('something');
});
