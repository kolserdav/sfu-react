import { ConnectionFactoryInterface } from '../interface';

class ConnectionFactory implements ConnectionFactoryInterface {
  public connection: WebSocket;

  public sendMessage: ConnectionFactoryInterface['sendMessage'] = (data) => {
    let res = '';
    try {
      res = JSON.stringify(data);
    } catch (e) {
      console.error(e);
      return 1;
    }
    this.connection.send(res);
    return 0;
  };

  public createWSConnection(url: string) {
    this.connection = new WebSocket(url);
    return this.connection;
  }

  constructor({ wsUrl }: { wsUrl: string }) {
    this.connection = this.createWSConnection(wsUrl);
  }
}

export default ConnectionFactory;
