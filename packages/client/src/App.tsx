import React from 'react';
import Main from './package/Main';
import './App.scss';

const createRoom = () => {
  window.location.href = 'secret-or-public-address-of-room?d=1';
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
