import React, { useMemo } from 'react';
import WS from './core/ws';
import RTC from './core/rtc';

function App() {
  const ws = useMemo(() => new WS({ port: '3001' }), []);
  const rtc = useMemo(() => new RTC({ ws }), [ws]);

  return <div className="App" />;
}

export default App;
