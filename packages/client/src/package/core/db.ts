import * as Types from '../types/interfaces';
import WS from './ws';
import { WS_TTL } from '../utils/constants';
import { log } from '../utils/lib';

const ws = new WS();

class DB {
  userId: number;

  token = 'null';

  constructor({ userId }: { userId: number }) {
    this.userId = userId;
  }

  public userCreate: Types.DBInterface['userCreate'] = (args, _connection) => {
    if (_connection) {
      const res: any = this.request({
        type: Types.MessageType.GET_USER_CREATE,
        result: Types.MessageType.SET_USER_CREATE,
        args,
        _connection,
      });
      return res;
    }
    return null;
    log('warn', 'userFindFirst _connection is', _connection);
  };

  public userFindFirst: Types.DBInterface['userFindFirst'] = (args, _connection) => {
    if (_connection) {
      const res: any = this.request({
        type: Types.MessageType.GET_USER_FINDFIRST,
        result: Types.MessageType.SET_USER_FIND_FIRST,
        args,
        _connection,
      });
      return res;
    }
    log('warn', 'userFindFirst _connection is', _connection);
    return null;
  };

  // eslint-disable-next-line class-methods-use-this
  private request<
    T extends keyof typeof Types.MessageType,
    U extends keyof typeof Types.MessageType
  >({
    args,
    type,
    _connection,
  }: {
    type: T;
    result: U;
    args: any;
    _connection: WebSocket;
  }): Promise<Types.ArgsSubset<U>> {
    const connection = _connection;
    const prom = new Promise<Types.ArgsSubset<U>>((resolve) => {
      ws.sendMessage(
        {
          id: this.userId,
          token: this.token,
          type,
          data: args,
        },
        connection
      );
    });
    return prom;
  }
}

export default DB;
