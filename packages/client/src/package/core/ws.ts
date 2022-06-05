import { MessageSubset, WSInterface, MessageType, DBInterface } from '../types/interfaces';
import { Prisma, User, PrismaPromise } from '../types/prisma';
import { log } from '../utils/lib';

class WS implements WSInterface, DBInterface {
  public connection: WebSocket;

  // eslint-disable-next-line class-methods-use-this
  public userFindFirst: DBInterface['userFindFirst'] = (args) => {
    const d: any = '';
    return d;
  };

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

  public sendMessage: WSInterface['sendMessage'] = (args) =>
    new Promise((resolve) => {
      setTimeout(() => {
        let res = '';
        try {
          res = JSON.stringify(args);
        } catch (e) {
          log('error', 'sendMessage', e);
          resolve(1);
        }
        this.connection.send(res);
        resolve(0);
      }, 0);
    });

  // eslint-disable-next-line class-methods-use-this
  public parseMessage: WSInterface['parseMessage'] = (message: string) => {
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
  public getMessage = <T extends keyof typeof MessageType>(
    message: MessageSubset<any>
  ): MessageSubset<T> => message as any;

  public createConnection() {
    if (typeof window !== 'undefined') {
      this.connection = new WebSocket(
        `${window.location.protocol === 'https' ? 'wss' : 'ws'}://${process.env.REACT_APP_SERVER}:${
          process.env.REACT_APP_PORT
        }`,
        'json'
      );
    }
    this.connection.onopen = (ev: Event) => {
      this.onOpen(ev);
    };
    this.connection.onmessage = (ev: MessageEvent<any>) => {
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

  constructor() {
    this.connection = this.createConnection();
  }
}

export default WS;
