/******************************************************************************************
 * Repository: https://github.com/kolserdav/react-node-webrtc-sfu.git
 * File name: types.d.ts
 * Author: Sergey Kolmiller
 * Email: <uyem.ru@gmail.com>
 * License: BSD-2-Clause
 * License text: Binary distributions of this software include 'wrtc' and other third-party libraries.
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Mon Jul 04 2022 10:58:51 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/
declare global {
  type LogLevel = 'info' | 'warn' | 'error';

  interface JWT {
    id: number;
    email: string;
    lastLogin: string;
    lastVisit: string;
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
