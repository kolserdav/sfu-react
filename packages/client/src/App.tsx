/******************************************************************************************
 * Repository: https://github.com/kolserdav/werift-sfu-react.git
 * File name: App.tsx
 * Author: Sergey Kolmiller
 * Email: <uyem.ru@gmail.com>
 * License: MIT
 * License text: See in LICENSE file
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Wed Aug 24 2022 14:14:09 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/
import React from 'react';
import Main from './package/Main';

const isTest = process.env.NODE_ENV === 'test';
const createRoom = () => {
  // Do not use the symbol "_" in room address
  window.location.href = `${new Date().getTime()}?uid=1`;
};

const userId = new Date().getTime();

function App() {
  const isHall = window.location.pathname === '/';

  return (
    <div className="uyem-app">
      {isHall ? (
        <button type="button" onClick={createRoom}>
          Create room
        </button>
      ) : (
        <Main
          // Required props *}
          userId={userId}
          // Optional props
          server={
            isTest
              ? (process.env.REACT_APP_SERVER_TEST as string)
              : (process.env.REACT_APP_SERVER as string)
          }
          port={parseInt(process.env.REACT_APP_PORT as string, 10)}
          iceServers={[
            {
              urls: [
                isTest
                  ? (process.env.REACT_APP_STUN_SERVER_TEST as string)
                  : (process.env.REACT_APP_STUN_SERVER as string),
              ],
            },
            {
              urls: [
                isTest
                  ? (process.env.REACT_APP_TURN_SERVER_TEST as string)
                  : (process.env.REACT_APP_TURN_SERVER as string),
              ],
              username: process.env.REACT_APP_TURN_SERVER_USER,
              credential: process.env.REACT_APP_TURN_SERVER_PASSWORD,
            },
          ]}
          name={Math.random().toString()}
          videoRecord
        />
      )}
    </div>
  );
}

export default App;
