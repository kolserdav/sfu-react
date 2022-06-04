import React, { createContext } from 'react';
import Router from './components/Router/Router';

const themes = {
  dark: {},
  light: {},
};

const MainContext = createContext(themes.dark);

// TODO theme provider
function Main(props: any) {
  return (
    <MainContext.Provider value={themes.light}>
      <Router />
    </MainContext.Provider>
  );
}

export default Main;
