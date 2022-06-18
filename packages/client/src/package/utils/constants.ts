/******************************************************************************************
 * Repository: https://github.com/kolserdav/uyem.git
 * File name: constants.ts
 * Author: Sergey Kolmiller
 * Email: <uyem.ru@gmail.com>
 * License: BSD-2-Clause
 * License text: Binary distributions of this software include WebRTC and other third-party libraries.
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Sun Jun 19 2022 01:44:53 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/
export const MEDIA_CONSTRAINTS = {
  audio: true,
  video: true,
};

export const WS_TTL = 1;
export const LOG_LEVEL = process.env.NODE_ENV === 'production' ? 3 : 2;
export const START_TIMEOUT = 999;
