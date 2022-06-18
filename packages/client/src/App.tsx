import React from 'react';
import Main from 'julia-teams';
import './App.scss';

const createRoom = () => {
  // Do not use the symbol "_" in room address
  window.location.href = 'room-address?d=1';
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
