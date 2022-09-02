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
import * as Types from '../types/interfaces';
import { log } from '../utils/lib';

type Protocol = 'room' | 'chat' | 'check';

class WS implements Types.WSInterface {
  public connection: WebSocket;

  userId: number | string = 0;

  public shareScreen = false;

  public name = '';

  public readonly delimiter = '_';

  public setUserId(userId: number | string) {
    this.userId = userId;
  }

  // eslint-disable-next-line class-methods-use-this
  public onOpen: (ev: Event) => void = () => {
    /** */
  };

  // eslint-disable-next-line class-methods-use-this
  public onMessage: (ev: MessageEvent<any>) => void = () => {
    /** */
  };

  // eslint-disable-next-line class-methods-use-this
  public onClose: (ev: CloseEvent) => void = () => {
    /** */
  };

  // eslint-disable-next-line class-methods-use-this
  public onError: (ev: Event) => void = () => {
    /** */
  };

  public sendMessage: Types.WSInterface['sendMessage'] = (args) =>
    new Promise((resolve) => {
      let res = '';
      try {
        res = JSON.stringify(args);
      } catch (e) {
        log('error', 'sendMessage', e);
        resolve(1);
      }
      log('log', 'sendMessage', res);
      if (!this.connection) {
        log('warn', 'WS connection is', this.connection);
        resolve(1);
      }
      try {
        this.connection.send(res);
      } catch (e) {
        log('error', 'Error send message', e);
      }
      resolve(0);
    });

  // eslint-disable-next-line class-methods-use-this
  public parseMessage: Types.WSInterface['parseMessage'] = (message) => {
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
  public getMessage: Types.WSInterface['getMessage'] = (type, data) => data as any;

  private newConnection({
    server,
    port,
    local = false,
    protocol = 'check',
  }: {
    server: string;
    port: number;
    local?: boolean;
    protocol?: Protocol;
  }): WebSocket {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let connection: any;
    if (typeof window !== 'undefined') {
      connection = new WebSocket(
        `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${server}:${port}`,
        protocol
      );
    }
    if (!local && connection !== null) {
      this.connection = connection;
    }
    return connection;
  }

  public createConnection({
    server,
    port,
    protocol,
  }: {
    server: string;
    port: number;
    protocol?: Protocol;
  }) {
    this.newConnection({ server, port, protocol });
    this.connection.onopen = (ev: Event) => {
      log('log', 'onOpen', ev);
      this.onOpen(ev);
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.connection.onmessage = (ev: MessageEvent<any>) => {
      log('log', 'onMessage', ev.data);
      this.onMessage(ev);
    };
    this.connection.onerror = (ev: Event) => {
      this.onError(ev);
    };
    this.connection.onclose = (ev: CloseEvent) => {
      this.onClose(ev);
    };
    return this.connection;
  }

  constructor({ server, port, protocol }: { server: string; port: number; protocol?: Protocol }) {
    this.connection = this.createConnection({ server, port, protocol });
  }
}

export default WS;
