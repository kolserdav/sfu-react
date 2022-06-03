import dotenv from 'dotenv';
import { WebSocketServer } from 'ws';
import wrtc from 'wrtc';
dotenv.config();
import { port } from './utils';

const wss = new WebSocketServer({ port });

wss.on('connection', function connection(ws) {
  console.log(ws);
  ws.on('message', function message(data) {
    console.log('received: %s', data);
  });

  ws.send('something');
});
