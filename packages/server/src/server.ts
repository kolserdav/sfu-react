/******************************************************************************************
 * Repository: https://github.com/kolserdav/werift-sfu-react.git
 * File name: server.ts
 * Author: Sergey Kolmiller
 * Email: <kolserdav@uyem.ru>
 * License: MIT
 * License text: See in LICENSE file
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Wed Aug 02 2023 23:56:49 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/
/**
 * This file only for testing the "npm run dev:next" script
 */
import { createServer } from './main';

createServer({
  port: 3001,
  onRoomOpen: (args) => {
    console.log('open', args);
  },
  onRoomClose: (args) => {
    console.log('close', args);
  },
  onRoomConnect: (args) => {
    console.log('connect', args);
  },
  onRoomDisconnect: (args) => {
    console.log('disconnect', args);
  },
});
