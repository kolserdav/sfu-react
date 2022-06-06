/* eslint-disable no-case-declarations */
import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import WS from '../../core/ws';
import DB from '../../core/db';
import { log, setLoginCookie } from '../../utils/lib';
import { MessageType } from '../../types/interfaces';

function Router() {
  const location = useLocation();
  const ws = useMemo(() => new WS(), []);
  const { pathname, search } = location;

  const [id, setId] = useState<number>(0);
  const db = useMemo(() => new DB(), []);
  useEffect(() => {
    ws.onOpen = (ev) => {
      log('info', 'onOpen', ev);
      ws.sendMessage({
        type: MessageType.GET_USER_ID,
        id,
        token: '',
        data: undefined,
      });
    };
    ws.onMessage = (ev) => {
      log('info', 'onMessage', ev);
      const { data } = ev;
      const rawMessage = ws.parseMessage(data);
      if (!rawMessage) {
        return;
      }
      const { type, id: _id } = rawMessage;
      let res;
      if (type === MessageType.SET_USER_ID) {
        ws.userId = _id;
        const args = {
          where: {
            id: 1,
          },
          select: { id: true, created: true },
        };
        res = db.userFindFirst(args);
        ws.sendMessage({
          id: ws.userId,
          token: db.token,
          type: MessageType.GET_USER_FIND_FIRST,
          data: {
            args,
          },
        });
      }
      switch (type) {
        case MessageType.SET_USER_ID:
          setId(ws.getMessage(MessageType.SET_USER_ID, rawMessage).id);
          break;
        case MessageType.SET_USER_FIND_FIRST:
          const r: Awaited<typeof res> = rawMessage.data.argv;
          console.log(r?.id, 1);
          break;
        default:
      }
    };
  }, []);

  useEffect(() => {
    /** */
  }, [id, db]);
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
