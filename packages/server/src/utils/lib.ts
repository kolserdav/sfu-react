import jwt from 'jsonwebtoken';
import { WEBTOKEN_KEY } from './constants';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const log = (type: 'info' | 'warn' | 'error', text: string, data?: any) => {
  console[type](type, text, data);
};

export function createToken(parsedToken: JWT): string | null {
  let token: string | null = null;
  try {
    token = jwt.sign(parsedToken, WEBTOKEN_KEY);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    log('error', 'createToken', err);
  }
  return token;
}

export function parseToken(token: string): JWTFull | null {
  if (!token || token === 'null' || token === 'undefined') {
    return null;
  }
  if (!/^[A-Za-z0-9-_]*\.[A-Za-z0-9-_]*\.[A-Za-z0-9-_]*$/.test(token)) {
    return null;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let data: any = null;
  try {
    data = jwt.verify(token, WEBTOKEN_KEY);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    if (token !== 'null') {
      log('error', 'parseToken', err);
    }
    data = null;
  }
  return data;
}
