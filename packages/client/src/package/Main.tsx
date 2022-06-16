import React, { createContext } from 'react';
import Room from './components/Room/Room';
import { RoomProps } from './types';

const themes = {
  dark: {},
  light: {},
};

const MainContext = createContext(themes.dark);

// TODO theme provider
function Main({ id }: RoomProps) {
  return (
    <MainContext.Provider value={themes.light}>
      <Room id={id} />
    </MainContext.Provider>
  );
}

export default Main;
