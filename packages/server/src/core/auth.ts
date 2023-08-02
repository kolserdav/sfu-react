/******************************************************************************************
 * Repository: https://github.com/kolserdav/werift-sfu-react.git
 * File name: auth.ts
 * Author: Sergey Kolmiller
 * Email: <kolserdav@uyem.ru>
 * License: MIT
 * License text: See in LICENSE file
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Wed Aug 02 2023 23:56:49 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/
import { Prisma } from '@prisma/client';
import { AUTH_UNIT_ID_DEFAULT } from '../utils/constants';
import { log } from '../utils/lib';

interface CheckTokenArgs {
  token: string;
}

class Auth {
  tokenList: string[] = [];

  // eslint-disable-next-line no-unused-vars
  checkTokenCb: (args: CheckTokenArgs) => Promise<{ errorCode: number; unitId: string }>;

  public setCheckTokenCb = (checkTokenCb: Auth['checkTokenCb']) => {
    this.checkTokenCb = checkTokenCb;
  };

  constructor() {
    this.checkTokenCb = this.checkTokenDefault;
  }

  // eslint-disable-next-line class-methods-use-this
  protected async checkTokenDefault(args: CheckTokenArgs) {
    log('warn', 'Check token callback not set, use default all yes', args);
    return {
      errorCode: 0,
      unitId: AUTH_UNIT_ID_DEFAULT,
    };
  }
}

export default Auth;
