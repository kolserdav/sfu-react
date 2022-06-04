/* eslint-disable no-case-declarations */
import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import WS from '../../core/ws';
import { log } from '../../utils';
import { MessageType } from '../../interfaces';

function Router() {
  const location = useLocation();
  const ws = useMemo(() => new WS(), []);
  const { pathname, search } = location;

  const [id, setId] = useState<number>(0);

  useEffect(() => {
    ws.onOpen = (ev) => {
      console.log(12);
      log('info', 'onOpen', ev);
      ws.sendMessage({
        type: MessageType.USER_ID,
        data: {
          id: 0,
        },
      });
    };
    ws.onMessage = (ev) => {
      log('info', 'onMessage', ev);
      console.log(ev);
      const rawMessage = ws.parseMessage(ev.data);
      const { type } = rawMessage;
      switch (type) {
        case MessageType.USER_KEY:
          setId(ws.getMessage<MessageType.USER_KEY>(rawMessage).id);
          break;
        default:
      }
    };
  }, []);
  console.log(id);
  return <div>ds</div>;
}

export default Router;
