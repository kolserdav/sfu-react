/* eslint-disable no-case-declarations */
import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import WS from '../../core/ws';
import { log, setLoginCookie } from '../../utils/lib';
import { MessageType } from '../../interfaces';

function Router() {
  const location = useLocation();
  const ws = useMemo(() => new WS(), []);
  const { pathname, search } = location;

  const [id, setId] = useState<number>(0);

  useEffect(() => {
    ws.onOpen = (ev) => {
      log('info', 'onOpen', ev);
      ws.sendMessage({
        type: MessageType.USER_ID,
        id: 0,
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
      console.log(ws.getMessage<MessageType.USER_KEY>(rawMessage).id, type);
      switch (type) {
        case MessageType.USER_KEY:
          setId(ws.getMessage<MessageType.USER_KEY>(rawMessage).id);
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
