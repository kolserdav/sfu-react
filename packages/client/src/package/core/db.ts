import * as Types from '../types/interfaces';
import WS from './ws';
import { WS_TTL } from '../utils/constants';

class DB extends WS implements Types.DBInterface {
  token = 'null';

  constructor() {
    super();
  }

  public userCreate: Types.DBInterface['userCreate'] = (args) => {
    const res: any = this.request({
      type: Types.MessageType.GET_USER_CREATE,
      result: Types.MessageType.SET_USER_CREATE,
      args: { data: {} },
    });
    return res;
  };

  public userFindFirst: Types.DBInterface['userFindFirst'] = (args) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res: any = this.request({
      type: Types.MessageType.GET_USER_FINDFIRST,
      result: Types.MessageType.SET_USER_FIND_FIRST,
      args,
    });
    return res;
  };

  private request<
    T extends keyof typeof Types.MessageType,
    U extends keyof typeof Types.MessageType
  >({ args }: { type: T; result: U; args: Types.ArgsSubset<T> }): Promise<Types.MessageSubset<U>> {
    const connection = this.newConnection({ local: true });
    const prom = new Promise<Types.MessageSubset<U>>((resolve) => {
      connection.onopen = () => {
        setTimeout(() => {
          const error: any = null;
          resolve(error);
        }, WS_TTL);
        connection.onmessage = (ev) => {
          const { data }: { data: Types.MessageSubset<U> } = ev as any;
          resolve(data);
        };
        this.sendMessage({
          type: Types.MessageType.GET_USER_FINDFIRST,
          data: {
            token: this.token,
            args,
          },
          connection,
        });
      };
    });
    return prom;
  }
}

export default DB;
