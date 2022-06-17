import React from 'react';
import Main from './package/Main';
import './App.scss';

const createRoom = () => {
  window.location.href = 'jfshoho';
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
        <Main id={new Date().getTime()} />
      )}
    </div>
  );
}

export default App;
