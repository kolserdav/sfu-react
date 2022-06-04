import { WebSocketServer, Server, WebSocket, ServerOptions } from 'ws';
import { MessageSubset, WSInterface, MessageType, MessageFull } from '../interfaces';
import { log } from '../utils';

class WS implements WSInterface {
  public connection: Server<WebSocket>;

  public sockets: Record<string, WebSocket> = {};

  constructor(connectionArgs: ServerOptions | undefined) {
    this.connection = this.createConnection(connectionArgs);
  }

  public createConnection: WSInterface['createConnection'] = (args: ServerOptions | undefined) => {
    this.connection = new WebSocketServer(args);
    return this.connection;
  };

  public parseMessage: WSInterface['parseMessage'] = (message: string): MessageFull<any> | null => {
    let data: any;
    try {
      data = JSON.parse(message);
    } catch (err) {
      log('error', 'parseMessage', err);
      return null;
    }
    return data;
  };

  public getMessage: WSInterface['getMessage'] = <T extends keyof typeof MessageType>(
    message: MessageSubset<any>
  ): MessageSubset<T> => {
    const res: any = message;
    return res;
  };

  public sendMessage: WSInterface['sendMessage'] = (ev) => {
    const { data } = ev;
    const { id } = data;
    let res = '';
    try {
      res = JSON.stringify(data);
    } catch (e) {
      log('error', 'sendMessage', e);
      return 1;
    }
    this.sockets[id].send(res);
    return 0;
  };
}

export default WS;
