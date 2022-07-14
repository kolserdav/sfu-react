/******************************************************************************************
 * Repository: https://github.com/kolserdav/react-node-webrtc-sfu.git
 * File name: App.tsx
 * Author: Sergey Kolmiller
 * Email: <uyem.ru@gmail.com>
 * License: MIT
 * License text: 
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Thu Jul 14 2022 16:24:49 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/
import React from 'react';
import Main from './package/Main';
import './App.scss';

const createRoom = () => {
  // Do not use the symbol "_" in room address
  window.location.href = `${new Date().getTime()}?uid=1`;
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
