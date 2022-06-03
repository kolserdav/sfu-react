import React, { useEffect, createContext } from 'react';
import { useLocation } from 'react-router-dom';

interface RouterContext {
  search: string;
  pathname: string;
}

function Router() {
  const location = useLocation();
  console.log(location);
  const { pathname, search } = location;
  useEffect(() => {
    const connection = new WebSocket(
      `${window.location.protocol === 'https' ? 'wss' : 'ws'}://${process.env.REACT_APP_SERVER}:${
        process.env.REACT_APP_PORT
      }/23`,
      'json'
    );
    console.log(connection);
  }, []);
  return <div>ds</div>;
}

export default Router;
