import * as Types from '../types/interfaces';
import WS from './ws';
import { WS_TTL } from '../utils/constants';

const ws = new WS();

class DB implements Types.DBInterface {
  token = 'null';

  public userCreate: Types.DBInterface['userCreate'] = (args) => {
    const res: any = this.request({
      type: Types.MessageType.GET_USER_CREATE,
      result: Types.MessageType.SET_USER_CREATE,
      args: {
        token: this.token,
        args,
      },
    });
    return res;
  };

  public userFindFirst: Types.DBInterface['userFindFirst'] = (args) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res: any = this.request({
      type: Types.MessageType.GET_USER_FINDFIRST,
      result: Types.MessageType.SET_USER_FIND_FIRST,
      args: {
        token: this.token,
        args,
      },
    });
    return res;
  };

  private request<
    T extends keyof typeof Types.MessageType,
    U extends keyof typeof Types.MessageType
  >({
    args,
    type,
  }: {
    type: T;
    result: U;
    args: Types.ArgsSubset<T>;
  }): Promise<Types.ArgsSubset<U>> {
    const connection = ws.newConnection({ local: true });
    const prom = new Promise<Types.ArgsSubset<U>>((resolve) => {
      connection.onopen = () => {
        setTimeout(() => {
          const error: any = null;
          resolve(error);
        }, WS_TTL);
        connection.onmessage = (ev) => {
          const { data }: { data: Types.ArgsSubset<U> } = ev as any;
          resolve(data);
        };
        ws.sendMessage({
          type,
          data: {
            token: this.token,
            args,
          } as any,
          connection,
        });
      };
    });
    return prom;
  }
}

export default DB;
