/******************************************************************************************
 * Repository: https://github.com/kolserdav/werift-sfu-react.git
 * File name: ws.ts
 * Author: Sergey Kolmiller
 * Email: <uyem.ru@gmail.com>
 * License: MIT
 * License text: See in LICENSE file
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Wed Aug 24 2022 14:14:09 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/
import { WebSocketServer, Server, WebSocket, ServerOptions } from 'ws';
import { WSInterface } from '../types/interfaces';
import { log } from '../utils/lib';
import DB from './db';

const db = new DB();

class WS implements WSInterface {
  public connection: Server<WebSocket>;

  public sockets: Record<string, WebSocket> = {};

  public readonly delimiter = '_';

  public users: Record<number | string, string> = {};

  public rooms: Record<number | string, string> = {};

  public WebSocket = WebSocket;

  constructor(connectionArgs: ServerOptions | undefined) {
    this.connection = this.createConnection(connectionArgs);
  }

  public async setSocket({
    id: _id,
    ws,
    connId,
    isRoom,
  }: {
    id: number | string;
    ws: WebSocket;
    connId: string;
    isRoom: boolean;
  }) {
    const oldSock = Object.keys(this.sockets).find((item) => {
      const sock = item.split(this.delimiter);
      return sock[0] === _id.toString();
    });
    if (oldSock) {
      if (this.sockets[oldSock]) {
        delete this.sockets[oldSock];
      }
    }
    this.sockets[this.getSocketId(_id.toString(), connId)] = ws;
    const id = _id.toString();
    if (!isRoom) {
      db.unitFindFirst({
        where: {
          id,
        },
      }).then((u) => {
        if (u) {
          db.unitUpdate({
            where: {
              id,
            },
            data: {
              updated: new Date(),
            },
          });
        } else {
          db.unitCreate({
            data: {
              id,
            },
          });
        }
      });
      this.users[id] = connId;
    } else {
      this.rooms[id] = connId;
    }
  }

  public getSocketId(id: string | number, connId: string) {
    return `${id}${this.delimiter}${connId}`;
  }

  public findSocketId(id: string) {
    return Object.keys(this.sockets).find((item) => item.split(this.delimiter)[0] === id) || null;
  }

  public createConnection = (args: ServerOptions | undefined) => {
    this.connection = new WebSocketServer(args, () => {
      log('info', 'Server listen at port:', args.port, true);
    });
    return this.connection;
  };

  // eslint-disable-next-line class-methods-use-this
  public parseMessage: WSInterface['parseMessage'] = (message) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let data: any;
    try {
      data = JSON.parse(message);
    } catch (err) {
      log('error', 'parseMessage', err);
      return null;
    }
    return data;
  };

  // eslint-disable-next-line class-methods-use-this
  public getMessage: WSInterface['getMessage'] = (type, data) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res: any = data;
    return res;
  };

  public sendMessage: WSInterface['sendMessage'] = (args, second) =>
    new Promise((resolve) => {
      setTimeout(() => {
        let res = '';
        try {
          res = JSON.stringify(args);
        } catch (e) {
          log('error', 'sendMessage', e);
          resolve(1);
        }
        const { id } = args;
        log('log', 'Send message', {
          id,
          data: args.data,
          type: args.type,
          u: this.users[id],
          s: Object.keys(this.sockets[this.getSocketId(id, this.users[id])] || {}).length,
          r: this.rooms[id],
          ss: Object.keys(this.sockets[this.getSocketId(id, this.rooms[id])] || {}).length,
        });
        let key = '';
        if (this.users[id] && this.sockets[this.getSocketId(id, this.users[id])]) {
          key = this.getSocketId(id, this.users[id]);
        } else if (this.rooms[id] && this.sockets[this.getSocketId(id, this.rooms[id])]) {
          key = this.getSocketId(id, this.rooms[id]);
        }
        if (this.sockets[key]) {
          this.sockets[key].send(res);
        } else if (!second) {
          setTimeout(() => {
            this.sendMessage(args, true);
          }, 3000);
        } else {
          log('warn', 'Send message without conected socket', {
            args,
            k: Object.keys(this.sockets),
            u: this.users,
            r: this.rooms,
          });
          resolve(1);
        }
        resolve(0);
      }, 0);
    });
}

export default WS;
