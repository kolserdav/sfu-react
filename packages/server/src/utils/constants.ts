/******************************************************************************************
 * Repository: https://github.com/kolserdav/werift-sfu-react.git
 * File name: constants.ts
 * Author: Sergey Kolmiller
 * Email: <uyem.ru@gmail.com>
 * License: MIT
 * License text: See in LICENSE file
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Fri Jul 29 2022 21:35:51 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/
export const LOG_LEVEL = 2;

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
