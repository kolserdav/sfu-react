/******************************************************************************************
 * Repository: https://github.com/kolserdav/werift-sfu-react.git
 * File name: App.tsx
 * Author: Sergey Kolmiller
 * Email: <uyem.ru@gmail.com>
 * License: MIT
 * License text: See in LICENSE file
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Fri Jul 29 2022 21:35:51 GMT+0700 (Krasnoyarsk Standard Time)
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
            server: process.env.REACT_APP_SERVER as string,
            port: parseInt(process.env.REACT_APP_PORT as string, 10),
            iceServers: [
              {
                urls: [process.env.REACT_APP_STUN_SERVER as string],
              },
              {
                urls: [process.env.REACT_APP_TURN_SERVER as string],
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
