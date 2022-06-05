declare global {
  type LogLevel = 'info' | 'warn' | 'error';

  interface JWT {
    id: string;
    loginTime: string;
  }

  interface JWTFull extends JWT {
    iat: number;
  }

  /**
   * @description dependendcy src/utils/lib.ts on replaceVariables
   */
  interface NotificationParams {
    email: string;
    lang: string;
    type: 'login';
    link: string;
  }
}

export {};
