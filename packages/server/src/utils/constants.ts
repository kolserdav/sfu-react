/******************************************************************************************
 * Repository: https://github.com/kolserdav/uyem.git
 * File name: constants.ts
 * Author: Sergey Kolmiller
 * Email: <uyem.ru@gmail.com>
 * License: BSD-2-Clause
 * License text: Binary distributions of this software include 'wrtc' and other third-party libraries.
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Fri Jul 01 2022 17:09:44 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/
export const LOG_LEVEL = process.env.NODE_ENV === 'production' ? 3 : 2;

export const DEFAULT_PORT = '3001';
export const PORT = parseInt(process.env.PORT || DEFAULT_PORT, 10);
