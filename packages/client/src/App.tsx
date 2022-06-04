import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import Main from './package/Main';
import './App.scss';

function App() {
  return (
    <BrowserRouter>
      <Main test="mest" />
    </BrowserRouter>
  );
}

export default App;
