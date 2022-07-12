/******************************************************************************************
 * Repository: https://github.com/kolserdav/react-node-webrtc-sfu.git
 * File name: constants.ts
 * Author: Sergey Kolmiller
 * Email: <uyem.ru@gmail.com>
 * License: BSD-2-Clause
 * License text: Binary distributions of this software include 'wrtc' and other third-party libraries.
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Mon Jul 04 2022 10:58:51 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/
export const LOG_LEVEL = process.env.NODE_ENV === 'production' ? 3 : 2;

export const DEFAULT_PORT = '3001';
export const HEADLESS = false;
export const VIEWPORT = {
  width: 800,
  height: 400,
};

export const PORT = parseInt(process.env.PORT || DEFAULT_PORT, 10);
export const DATABASE_URL = process.env.DATABASE_URL as string;
export const CORS = process.env.CORS as string;
export const APP_URL = process.env.APP_URL as string;
