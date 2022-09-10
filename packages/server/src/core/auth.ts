import { log } from '../utils/lib';

class Auth {
  tokenList: string[] = [];

  checkTokenCb: (token: string) => Promise<boolean>;

  constructor(_checkTockenCb: Auth['checkTokenCb']) {
    this.checkTokenCb = _checkTockenCb;
  }

  // eslint-disable-next-line class-methods-use-this
  protected async checkToken(token: string) {
    return true;
  }

  // eslint-disable-next-line class-methods-use-this
  protected async checkTockenDefault(token: string) {
    log('warn', 'Check token callback not set, use default all yes', { token });
    return true;
  }
}

export default Auth;
