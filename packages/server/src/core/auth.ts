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
import { log } from '../utils/lib';

interface CheckTokenArgs {
  token: string;
  // TODO need check model
  // model: keyof typeof Prisma.ModelName;
  // modelId: string;
  // userId: string;
}

class Auth {
  tokenList: string[] = [];

  // eslint-disable-next-line no-unused-vars
  checkTokenCb: (args: CheckTokenArgs) => Promise<boolean>;

  public setCheckTokenCb = (checkTokenCb: Auth['checkTokenCb']) => {
    this.checkTokenCb = checkTokenCb;
  };

  constructor() {
    this.checkTokenCb = this.checkTockenDefault;
  }

  // eslint-disable-next-line class-methods-use-this
  protected async checkTockenDefault(args: CheckTokenArgs) {
    log('warn', 'Check token callback not set, use default all yes', args);
    return true;
  }
}

export default Auth;
