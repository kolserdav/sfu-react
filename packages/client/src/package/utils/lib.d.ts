/******************************************************************************************
 * Repository: https://github.com/kolserdav/react-node-webrtc-sfu.git
 * File name: lib.d.ts
 * Author: Sergey Kolmiller
 * Email: <uyem.ru@gmail.com>
 * License: BSD-2-Clause
 * License text: Binary distributions of this software include 'wrtc' and other third-party libraries.
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Mon Jul 04 2022 10:58:51 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/
declare enum LogLevel {
    log = 0,
    info = 1,
    warn = 2,
    error = 3
}
export declare const log: (type: keyof typeof LogLevel, text: string, data?: any) => void;
export declare const getTarget: (pathname: string) => string;
export declare const parseMessage: (message: string) => object;
export declare const parseQueryString: (query: string) => Record<string, string> | null;
export {};
