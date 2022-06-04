import { WSInterface } from '../interfaces';
import { log } from '../utils';

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

  public sendMessage: WSInterface['sendMessage'] = (data) => {
    let res = '';
    try {
      res = JSON.stringify(data);
    } catch (e) {
      log('error', 'sendMessage', e);
      return 1;
    }
    this.connection.send(res);
    return 0;
  };

  public createConnection() {
    this.connection = new WebSocket(
      `${window.location.protocol === 'https' ? 'wss' : 'ws'}://${process.env.REACT_APP_SERVER}:${
        process.env.REACT_APP_PORT
      }`,
      'json'
    );
    this.connection.onopen = (ev: Event) => {
      this.onOpen(ev);
    };
    return this.connection;
  }

  constructor() {
    this.connection = this.createConnection();
  }
}

export default WS;
