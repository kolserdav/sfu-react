import React, { useMemo, useEffect, useState } from 'react';
import WS from './core/ws';
import RTC from './core/rtc';
import { MessageType } from './types/interfaces';
import { getRoomId, parseQueryString } from './utils/lib';

function App() {
  const ws = useMemo(() => new WS({ port: '3001' }), []);
  const rtc = useMemo(() => new RTC({ ws }), [ws]);
  const roomId = useMemo(() => getRoomId(window.location.pathname), []);
  const qs = useMemo(() => parseQueryString(window.location.search), []);
  const ownerId = qs?.uid;

  useEffect(() => {
    if (!ownerId) {
      return;
    }
    ws.onOpen = () => {
      ws.sendMessage({
        type: MessageType.GET_USER_ID,
        id: roomId,
        data: {
          isRoom: true,
        },
        connId: '',
      });
    };
    ws.onMessage = (ev) => {
      const { data } = ev;
      const rawMessage = ws.parseMessage(data);
      if (!rawMessage) {
        return;
      }
      const { type, connId } = rawMessage;
      switch (type) {
        case MessageType.SET_USER_ID:
          ws.setUserId(roomId);
          rtc.rooms[roomId] = [ownerId];
          ws.sendMessage({
            type: MessageType.SET_ROOM_LOAD,
            connId,
            data: {
              roomId,
            },
            id: ownerId,
          });
          break;
        case MessageType.OFFER:
          rtc.handleOfferMessage(ws.getMessage(MessageType.OFFER, rawMessage));
          break;
        case MessageType.ANSWER:
          rtc.handleVideoAnswerMsg(ws.getMessage(MessageType.ANSWER, rawMessage));
          break;
        case MessageType.CANDIDATE:
          rtc.handleCandidateMessage(ws.getMessage(MessageType.CANDIDATE, rawMessage));
          break;
      }
    };
  });
  return <div className="App" />;
}

export default App;
