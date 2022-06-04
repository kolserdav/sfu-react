import React, { useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import WS from '../../core/ws';
import { log } from '../../utils';
import { MessageType } from '../../interfaces';

function Router() {
  const location = useLocation();
  const ws = new WS();
  const { pathname, search } = location;
  useEffect(() => {
    ws.onOpen = (ev) => {
      log('info', 'onOpen', ev);
      ws.sendMessage({
        type: MessageType.USER_ID,
        data: {
          id: new Date().getTime(),
          key: '',
        },
      });
    };
    ws.onMessage = (ev) => {
      log('info', 'onMessage', ev);
    };
  }, []);
  return <div>ds</div>;
}

export default Router;
