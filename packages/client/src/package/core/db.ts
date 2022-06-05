import * as Types from '../types/interfaces';
import WS from './ws';
import { WS_TTL } from '../utils/constants';

const ws = new WS();

class DB implements Types.DBInterface {
  token = 'null';

  public userCreate: Types.DBInterface['userCreate'] = (args) => {
    const res: any = this.request({
      type: Types.RequestType.GET_USER_CREATE,
      result: Types.RequestType.SET_USER_CREATE,
      args,
    });
    return res;
  };

  public userFindFirst: Types.DBInterface['userFindFirst'] = (args) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res: any = this.request({
      type: Types.RequestType.GET_USER_FINDFIRST,
      result: Types.RequestType.SET_USER_FIND_FIRST,
      args,
    });
    return res;
  };

  private request<T extends Types.OriginType, U extends Types.OriginType>({
    args,
  }: {
    type: T;
    result: U;
    args: Types.Options<T>;
  }): Promise<Types.Options<U>> {
    const connection = ws.newConnection({ local: true });
    const prom = new Promise<Types.Options<U>>((resolve) => {
      connection.onopen = () => {
        setTimeout(() => {
          const error: any = null;
          resolve(error);
        }, WS_TTL);
        connection.onmessage = (ev) => {
          const { data }: { data: Types.Options<U> } = ev as any;
          resolve(data);
        };
        ws.sendMessage({
          type: Types.RequestType.GET_USER_FINDFIRST,
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
