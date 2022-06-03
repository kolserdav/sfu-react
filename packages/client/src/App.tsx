import React, { createContext } from 'react';
import { BrowserRouter } from 'react-router-dom';
import Router from './components/Router/Router';
import './App.scss';

function App() {
  return (
    <BrowserRouter>
      <Router />
    </BrowserRouter>
  );
}

export default App;
