import { TEMPORARY_PATH, TOKEN_QUERY_NAME } from '../types/interfaces';
import { log } from './lib';

class Request {
  port: number;

  server: string;

  protocol: string;

  constructor({ port, server }: { port: number; server: string }) {
    this.port = port;
    this.server = server;
    this.protocol = `${typeof window !== 'undefined' ? window.location.protocol : 'http'}//`;
  }

  // eslint-disable-next-line class-methods-use-this
  private async send({
    responseType,
    token,
    url,
  }: {
    url: string;
    token?: string;
    responseType?: XMLHttpRequest['responseType'];
  }) {
    return new Promise((resolve) => {
      const req = new XMLHttpRequest();
      req.responseType = 'json' || responseType;
      req.onload = () => {
        resolve(req.response);
      };
      req.onabort = () => {
        log('error', 'Request abort', { url });
        resolve(1);
      };
      req.onerror = (e) => {
        log('error', 'Request error', e);
        resolve(1);
      };
      req.open(
        'GET',
        `${this.protocol}${this.server}:${this.port}${url}?${TOKEN_QUERY_NAME}=${token}`
      );
      req.send();
    });
  }

  public async getTmpDir({ dirName, token }: { dirName: string; token: string }) {
    return this.send({
      url: `/${TEMPORARY_PATH}/${dirName}`,
      token,
    });
  }
}

export default Request;
