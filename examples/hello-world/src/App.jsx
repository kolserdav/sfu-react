// @ts-check

import React from 'react';
import { UyemHall } from 'uyem/client';
import './App.css';

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
        <Uyem id={window.location.search.replace(/\?uid=/, '')} />
      )}
    </div>
  );
}

export default App;
