/******************************************************************************************
 * Repository: https://github.com/kolserdav/uyem.git
 * File name: ws.ts
 * Author: Sergey Kolmiller
 * Email: <uyem.ru@gmail.com>
 * License: BSD-2-Clause
 * License text: Binary distributions of this software include 'wrtc' and other third-party libraries.
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Tue Jun 21 2022 08:49:55 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/
import * as Types from '../types/interfaces';
declare class WS implements Types.WSInterface {
    connection: WebSocket;
    userId: number | string;
    shareScreen: boolean;
    setUserId(userId: number | string): void;
    onOpen: (ev: Event) => void;
    onMessage: (ev: MessageEvent<any>) => void;
    onClose: (ev: CloseEvent) => void;
    onError: (ev: Event) => void;
    sendMessage: Types.WSInterface['sendMessage'];
    parseMessage: Types.WSInterface['parseMessage'];
    getMessage: Types.WSInterface['getMessage'];
    private newConnection;
    createConnection(): WebSocket;
    constructor({ shareScreen }: {
        shareScreen: boolean;
    });
}
export default WS;
