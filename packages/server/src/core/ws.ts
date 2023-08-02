/******************************************************************************************
 * Repository: https://github.com/kolserdav/werift-sfu-react.git
 * File name: ws.ts
 * Author: Sergey Kolmiller
 * Email: <kolserdav@uyem.ru>
 * License: MIT
 * License text: See in LICENSE file
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Wed Aug 02 2023 23:56:49 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/
import { WebSocketServer, Server, WebSocket, ServerOptions } from 'ws';
import { createServer } from 'http';
import { WSInterface, UserItem, LocaleValue, TOKEN_QUERY_NAME } from '../types/interfaces';
import { checkDefaultAuth, getLocale, log, parseQueryString } from '../utils/lib';
import DB from './db';
import Http from './http';
import { TMP_REGEX, VIDEO_REGEX } from '../utils/constants';

const server = createServer();

class WS extends DB implements WSInterface {
  public connection: Server<WebSocket>;

  public sockets: Record<string, WebSocket> = {};

  public readonly delimiter = '_';

  public users: Record<number | string, UserItem> = {};

  public rooms: Record<number | string, string> = {};

  private http: Http;

  public WebSocket = WebSocket;

  constructor(
    connectionArgs: ServerOptions & {
      cloudPath: string;
      prisma: DB['prisma'];
    }
  ) {
    const { cloudPath, prisma } = connectionArgs;
    super({ prisma });
    this.http = new Http({ prisma, cloudPath });
    const _connectionArgs = { ...connectionArgs };
    _connectionArgs.server = server;
    delete _connectionArgs.port;
    this.connection = this.createConnection(_connectionArgs);
    server.listen(connectionArgs.port);
    server.on('request', async (req, res) => {
      // CORS
      const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'OPTIONS, POST, GET',
        'Access-Control-Max-Age': 2592000,
      };
      if (req.method === 'OPTIONS') {
        res.writeHead(204, headers);
        res.end();
        return;
      }
      if (['GET', 'POST'].indexOf(req.method || 'GET') > -1) {
        Object.keys(headers).forEach((key) => {
          res.setHeader(key, headers[key as keyof typeof headers]);
        });
      }

      const { url: _url } = req;
      if (!_url) {
        res.writeHead(400);
        res.end();
        return;
      }

      // Check token
      const queryString = _url.match(/\?.*$/);
      if (!queryString) {
        res.writeHead(422);
        res.end();
        return;
      }
      const qS = queryString[0];
      const url = _url.replace(qS, '');
      const { [TOKEN_QUERY_NAME]: token } = parseQueryString(qS);
      const { errorCode, unitId } = await this.checkTokenCb({ token });
      const isDefaultAuth = checkDefaultAuth({ unitId });
      if (errorCode !== 0 && !isDefaultAuth) {
        res.writeHead(403);
        res.end();
        return;
      }

      const isVideos = VIDEO_REGEX.test(url || '');
      const isTmp = TMP_REGEX.test(url || '');
      if (isVideos) {
        await this.http.getVideoHandler({
          isDefaultAuth,
          res,
          req,
          unitId,
          url,
        });
      } else if (isTmp) {
        await this.http.getTmpHandler({
          isDefaultAuth,
          res,
          req,
          unitId,
          url,
        });
      } else {
        res.writeHead(501);
        res.end();
      }
    });
  }

  public async setSocket({
    id: _id,
    ws,
    connId,
    isRoom,
    userName,
    locale,
  }: {
    id: number | string;
    ws: WebSocket;
    connId: string;
    isRoom: boolean;
    locale: LocaleValue;
    userName: string;
  }) {
    if (checkDefaultAuth({ unitId: _id.toString() })) {
      return;
    }
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
      const u = await this.unitFindFirst({
        where: {
          id,
        },
      });
      if (u) {
        await this.unitUpdate({
          where: {
            id,
          },
          data: {
            name: userName,
            updated: new Date(),
          },
        });
      } else {
        await this.unitCreate({
          data: {
            id,
            name: userName,
          },
        });
      }
      this.users[id] = {
        connId,
        name: userName,
        locale,
      };
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
    this.connection = new WebSocketServer(args);
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

  public getLocale({ userId }: { userId: string | number }) {
    return getLocale(this.users[userId].locale).server;
  }

  public sendMessage: WSInterface['sendMessage'] = (args, second, cb) =>
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
          s: Object.keys(this.sockets[this.getSocketId(id, this.users[id]?.connId)] || {}).length,
          r: this.rooms[id],
          ss: Object.keys(this.sockets[this.getSocketId(id, this.rooms[id])] || {}).length,
        });
        let key = '';
        if (this.users[id]?.connId && this.sockets[this.getSocketId(id, this.users[id]?.connId)]) {
          key = this.getSocketId(id, this.users[id].connId);
        } else if (this.rooms[id] && this.sockets[this.getSocketId(id, this.rooms[id])]) {
          key = this.getSocketId(id, this.rooms[id]);
        }
        if (this.sockets[key]) {
          this.sockets[key].send(res, cb);
        } else if (!second) {
          setTimeout(() => {
            this.sendMessage(args, true, cb);
          }, 3000);
        } else {
          log('warn', 'Send message without conected socket', {
            args,
          });
          resolve(1);
        }
        resolve(0);
      }, 0);
    });
}

export default WS;
