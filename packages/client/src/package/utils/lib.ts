import { Cookies } from 'react-cookie';
import { COOKIE_USER_ID } from './constants';

const cookies = new Cookies();

export const log = (type: 'info' | 'warn' | 'error', text: string, data?: any) => {
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

export const getLoginCookie = () => cookies.get(COOKIE_USER_ID);
