/* eslint-disable no-case-declarations */
import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import WS from '../../core/ws';
import { log, setLoginCookie } from '../../utils/lib';
import { MessageType, Awaited, DBInterface } from '../../types/interfaces';

function Router() {
  const location = useLocation();
  const ws = useMemo(() => new WS(), []);
  const { pathname, search } = location;

  const [id, setId] = useState<number>(0);

  useEffect(() => {
    ws.onOpen = (ev) => {
      log('info', 'onOpen', ev);
      ws.sendMessage({
        type: MessageType.GET_USER_ID,
        data: {
          id,
        },
      });
    };
    ws.onMessage = (ev) => {
      log('info', 'onMessage', ev);
      const { data } = ev;
      const rawMessage = ws.parseMessage(data);
      if (!rawMessage) {
        return;
      }
      const { type } = rawMessage;
      switch (type) {
        case MessageType.SET_USER_ID:
          setId(ws.getMessage<MessageType.SET_USER_ID>(rawMessage).id);
          break;
        default:
      }
    };
  }, []);

  /**
   * Save id
   */
  useEffect(() => {
    if (id) {
      setLoginCookie({ userId: id });
    }
  }, [id]);

  return <div>ds</div>;
}

export default Router;
