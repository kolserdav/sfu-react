/******************************************************************************************
 * Repository: https://github.com/kolserdav/werift-sfu-react.git
 * File name: server.ts
 * Author: Sergey Kolmiller
 * Email: <uyem.ru@gmail.com>
 * License: MIT
 * License text: See in LICENSE file
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Wed Nov 23 2022 15:23:26 GMT+0700 (Krasnoyarsk Standard Time)
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
