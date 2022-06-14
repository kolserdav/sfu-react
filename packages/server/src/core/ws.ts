import { WebSocketServer, Server, WebSocket, ServerOptions } from 'ws';
import { WSInterface } from '../types/interfaces';
import { log } from '../utils/lib';

class WS implements WSInterface {
  public connection: Server<WebSocket>;

  public sockets: Record<string, WebSocket> = {};

  public users: Record<number, string> = {};
  public rooms: Record<number, string> = {};

  public websocket = WebSocket;

  constructor(connectionArgs: ServerOptions | undefined) {
    this.connection = this.createConnection(connectionArgs);
  }

  public setSocket({
    id,
    ws,
    connId,
    isRoom,
  }: {
    id: number;
    ws: WebSocket;
    connId: string;
    isRoom?: boolean;
  }) {
    this.sockets[connId] = ws;
    if (!isRoom) {
      this.users[id] = connId;
    } else {
      this.rooms[id] = connId;
    }
  }

  public createConnection = (args: ServerOptions | undefined) => {
    this.connection = new WebSocketServer(args);
    return this.connection;
  };

  public parseMessage: WSInterface['parseMessage'] = (message) => {
    let data: any;
    try {
      data = JSON.parse(message);
    } catch (err) {
      log('error', 'parseMessage', err);
      return null;
    }
    return data;
  };

  public getMessage: WSInterface['getMessage'] = (type, data) => {
    const res: any = data;
    return res;
  };

  public sendMessage: WSInterface['sendMessage'] = (args) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        let res = '';
        try {
          res = JSON.stringify(args);
        } catch (e) {
          log('error', 'sendMessage', e);
          resolve(1);
        }
        const { id } = args;
        if (this.users[id]) {
          this.sockets[this.users[id]].send(res);
        } else if (this.rooms[id]) {
          this.sockets[this.rooms[id]].send(res);
        }
        resolve(0);
      }, 100);
    });
  };
}

export default WS;
