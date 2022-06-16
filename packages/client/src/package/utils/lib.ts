import { Cookies } from 'react-cookie';
import { LOG_LEVEL } from './constants';

// eslint-disable-next-line no-unused-vars
enum LogLevel {
  log = 0,
  info = 1,
  warn = 2,
  error = 3,
}

export const log = (type: 'info' | 'warn' | 'error' | 'log', text: string, data?: any) => {
  if (LogLevel[type] >= LOG_LEVEL) {
    // eslint-disable-next-line no-console
    console[type](type, text, data);
  }
};

export const getTarget = (pathname: string) => {
  const res = parseInt(pathname.replace(/^\//, ''), 10);
  return Number.isNaN(res) ? null : res;
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

export const compareNumbers = (a: number, b: number) => parseInt(`${a}${b}`, 10);
