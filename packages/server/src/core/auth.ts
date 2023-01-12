/******************************************************************************************
 * Repository: https://github.com/kolserdav/werift-sfu-react.git
 * File name: auth.ts
 * Author: Sergey Kolmiller
 * Email: <uyem.ru@gmail.com>
 * License: MIT
 * License text: See in LICENSE file
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Wed Nov 23 2022 15:23:26 GMT+0700 (Krasnoyarsk Standard Time)
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
