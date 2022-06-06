import * as Types from '../types/interfaces';
import WS from './ws';
import { WS_TTL } from '../utils/constants';
import { log } from '../utils/lib';

const ws = new WS();

class DB {
  token = 'null';

  // eslint-disable-next-line class-methods-use-this
  public userCreate: Types.DBInterface['userCreate'] = (args) => {
    const res: any = null;
    return res;
  };

  // eslint-disable-next-line class-methods-use-this
  public userFindFirst: Types.DBInterface['userFindFirst'] = (args) => {
    const res: any = null;
    return res;
  };
}

export default DB;
