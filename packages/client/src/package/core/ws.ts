/******************************************************************************************
 * Repository: https://github.com/kolserdav/uyem.git
 * File name: ws.ts
 * Author: Sergey Kolmiller
 * Email: <uyem.ru@gmail.com>
 * License: BSD-2-Clause
 * License text: Binary distributions of this software include 'wrtc' and other third-party libraries.
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Tue Jun 21 2022 08:49:55 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/
import * as Types from '../types/interfaces';
import { log } from '../utils/lib';

class WS implements Types.WSInterface {
  public connection: WebSocket;

  userId: number | string = 0;

  public shareScreen: boolean;

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
      this.connection.send(res);
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

  private newConnection({ local = false }: { local?: boolean }): WebSocket {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let connection: any;
	  if (typeof window !== 'undefined') {
      connection = new WebSocket(
        `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${
          process.env.REACT_APP_SERVER
        }:${process.env.REACT_APP_PORT}`,
        'json'
      );
    }
    if (!local && connection !== null) {
      this.connection = connection;
    }
    return connection;
  }

  public createConnection() {
    this.newConnection({});
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

  constructor({ shareScreen }: { shareScreen: boolean }) {
    this.connection = this.createConnection();
    this.shareScreen = shareScreen;
  }
}

export default WS;
