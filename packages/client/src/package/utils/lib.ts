import { Cookies } from 'react-cookie';
import { COOKIE_USER_ID, COOKIE_TOKEN } from './constants';

const cookies = new Cookies();

export const log = (type: 'info' | 'warn' | 'error' | 'log', text: string, data?: any) => {
  // eslint-disable-next-line no-console
  console[type](type, text, data);
};

export const getTarget = () => {
  const {
    location: { pathname },
  } = window;
  return parseInt(pathname.replace(/^\//, ''), 10);
};

export const parseMessage = (message: string): object => {
  let result = {};
  try {
    result = JSON.parse(message);
  } catch (e) {
    /** */
  }
  return result;
};

export const isRoom = () => window.location.search === '?room=1';

export const setLoginCookie = ({ userId }: { userId: number }) => {
  const expires = new Date();
  expires.setMonth(expires.getMonth() + 1);
  cookies.set(COOKIE_USER_ID, userId, {
    sameSite: true,
    expires,
    secure: true,
  });
};

export const getLoginCookie = (): number => {
  const str = cookies.get(COOKIE_USER_ID);
  const num = parseInt(str, 10);
  return Number.isNaN(num) ? 0 : num;
};

export const setTokenCookie = (token: string) => {
  const expires = new Date();
  expires.setMonth(expires.getMonth() + 1);
  cookies.set(COOKIE_TOKEN, token, {
    sameSite: true,
    expires,
    secure: true,
  });
};

export const getTokenCookie = (): { token: string } | null => {
  const str = cookies.get(COOKIE_TOKEN);
  return str
    ? {
        token: str,
      }
    : null;
};

export const parseQueryString = (query: string): Record<string, string> | null => {
  const arr = query.replace(/\??/, '').split('&');
  let res: Record<string, string> | null = null;
  arr.forEach((item) => {
    if (item === '') {
      return;
    }
    if (res === null) {
      res = {};
    }
    const propReg = /^\w+=/;
    const prop = item.match(propReg);
    const propStr = prop ? prop[0].replace('=', '') : '';
    res[propStr] = item.replace(propReg, '');
  });
  return res;
};
