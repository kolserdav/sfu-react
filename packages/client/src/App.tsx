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
// import { Room } from 'uyem/client';
import './App.scss';

const createRoom = () => {
  // Do not use the symbol "_" in room address
  window.location.href = `room-address?d=1`;
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
        <Main id={window.location.search.replace(/[?=]*/g, '')} />
      )}
    </div>
  );
}

export default App;
