import * as Types from '../types/interfaces';
import WS from './ws';
import { WS_TTL } from '../utils/constants';
import { log } from '../utils/lib';

class DB implements Types.DBInterface {
  token = 'null';

  // eslint-disable-next-line class-methods-use-this
  public guestCreate: Types.DBInterface['guestCreate'] = (args) => {
    const res: any = null;
    return res;
  };

  // eslint-disable-next-line class-methods-use-this
  public guestUpdate: Types.DBInterface['guestUpdate'] = (args) => {
    const res: any = null;
    return res;
  };

  // eslint-disable-next-line class-methods-use-this
  public guestFindFirst: Types.DBInterface['guestFindFirst'] = (args) => {
    const res: any = null;
    return res;
  };
}

export default DB;
