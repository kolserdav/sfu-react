import { MessageSubset, WSInterface, MessageType } from '../types/interfaces';
import { log } from '../utils/lib';

class WS implements WSInterface {
  public connection: WebSocket;

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

  protected newConnection({ local = false }: { local?: boolean }): WebSocket {
    let connection: any;
    if (typeof window !== 'undefined') {
      connection = new WebSocket(
        `${window.location.protocol === 'https' ? 'wss' : 'ws'}://${process.env.REACT_APP_SERVER}:${
          process.env.REACT_APP_PORT
        }`,
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
