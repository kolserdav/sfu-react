import { LOG_LEVEL } from './constants';

// eslint-disable-next-line no-unused-vars
enum LogLevel {
  log = 0,
  info = 1,
  warn = 2,
  error = 3,
}

export const log = (type: keyof typeof LogLevel, text: string, data?: any) => {
  if (LogLevel[type] >= LOG_LEVEL) {
    // eslint-disable-next-line no-console
    console[type](type, text, data);
  }
};

export const getTarget = (pathname: string) => pathname.replace(/^\//, '');

export const parseMessage = (message: string): object => {
  let result = {};
  try {
    result = JSON.parse(message);
  } catch (e) {
    /** */
  }
  return result;
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

export const getComparedString = (roomId: number | string, target: number | string) =>
  `${roomId}-${target || 0}`;
