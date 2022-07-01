/******************************************************************************************
 * Repository: https://github.com/kolserdav/uyem.git
 * File name: App.tsx
 * Author: Sergey Kolmiller
 * Email: <uyem.ru@gmail.com>
 * License: BSD-2-Clause
 * License text: Binary distributions of this software include 'wrtc' and other third-party libraries.
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Tue Jun 21 2022 08:49:55 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/
import React from 'react';
import Main from './package/Main';
import './App.scss';

const createRoom = () => {
  // Do not use the symbol "_" in room address
  window.location.href = `room-${new Date().getTime()}?uid=1`;
};

function App() {
  const isHall = window.location.pathname === '/';
  return (
    <div>
      {isHall ? (
        <button type="button" onClick={createRoom}>
          Create room
        </button>
      ) : (
        <Main
          room={{
            server: process.env.REACT_APP_SERVER,
            port: parseInt(process.env.REACT_APP_PORT, 10),
            iceServers: [
              {
                urls: [process.env.REACT_APP_STUN_SERVER],
              },
              {
                urls: [process.env.REACT_APP_TURN_SERVER],
                username: process.env.REACT_APP_TURN_SERVER_USER,
                credential: process.env.REACT_APP_TURN_SERVER_PASSWORD,
              },
            ],
            id: window.location.search.replace(/\?uid=/, ''),
          }}
        />
      )}
    </div>
  );
}

export default App;
