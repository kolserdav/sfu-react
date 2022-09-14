import { log } from '../utils/lib';

class Auth {
  tokenList: string[] = [];

  // eslint-disable-next-line no-unused-vars
  checkTokenCb: (token: string) => Promise<boolean>;

  public setCheckTokenCb = (checkTokenCb: Auth['checkTokenCb']) => {
    this.checkTokenCb = checkTokenCb;
  };

  constructor() {
    this.checkTokenCb = this.checkTockenDefault;
  }

  // eslint-disable-next-line class-methods-use-this
  protected async checkTockenDefault(token: string) {
    log('warn', 'Check token callback not set, use default all yes', { token });
    return true;
  }
}

export default Auth;
