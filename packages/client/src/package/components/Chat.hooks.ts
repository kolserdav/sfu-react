import React, { useEffect, useState, useMemo } from 'react';
import WS from '../core/ws';
import { log } from '../utils/lib';
import { MessageType, SendMessageArgs } from '../types/interfaces';
import { CHAT_TAKE_MESSAGES } from '../utils/constants';

// eslint-disable-next-line import/prefer-default-export
export const useMesages = ({
  port,
  server,
  roomId,
  userId,
  containerRef,
}: {
  port: number;
  server: string;
  roomId: string | number;
  userId: string | number;
  containerRef: React.RefObject<HTMLDivElement>;
}) => {
  const [message, setMessage] = useState<string>('');
  const [chatUnit, setChatUnit] = useState<boolean>(false);
  const [myMessage, setMyMessage] = useState<boolean>(false);
  const [skip, setSkip] = useState<number>(0);
  const [messages, setMessages] = useState<
    SendMessageArgs<MessageType.SET_CHAT_MESSAGES>['data']['result'] | null
  >(null);

  const ws = useMemo(
    () => new WS({ server, port: port.toString(), shareScreen: false }),
    [port, server]
  );

  const changeText = (e: React.FormEvent<HTMLInputElement>) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { target }: any = e;
    setMessage(target.value);
  };

  const sendMessage = () => {
    if (message) {
      ws.sendMessage({
        type: MessageType.GET_ROOM_MESSAGE,
        connId: '',
        id: roomId,
        data: {
          message,
          userId,
        },
      });
    }
  };

  const setChatMessagesHandler = ({
    data: { result },
  }: SendMessageArgs<MessageType.SET_CHAT_MESSAGES>) => {
    let _result = [];
    for (let i = result.length - 1; i >= 0; i--) {
      _result.push(result[i]);
    }
    if (messages) {
      _result = _result.concat(messages);
    }
    setMessages(_result);
  };

  /**
   * Get first chat messages
   */
  useEffect(() => {
    if (chatUnit) {
      ws.sendMessage({
        type: MessageType.GET_CHAT_MESSAGES,
        id: roomId,
        connId: '',
        data: {
          userId,
          args: {
            where: {
              roomId: roomId.toString(),
            },
            orderBy: {
              created: 'desc',
            },
            take: CHAT_TAKE_MESSAGES,
            skip,
          },
        },
      });
    }
  }, [ws, roomId, chatUnit, userId, skip]);

  /**
   * Scroll to my new message
   */
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: containerRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [myMessage, containerRef]);

  /**
   * Container scroll handler
   */
  useEffect(() => {
    const containerOnScroll = () => {
      const { current } = containerRef;
      if (current) {
        if (current.scrollTop === 0) {
          setSkip(skip + CHAT_TAKE_MESSAGES);
          current.scrollTo({ top: 1 });
        }
      }
    };
    const { current } = containerRef;
    if (current) {
      current.addEventListener('scroll', containerOnScroll);
    }
    return () => {
      if (current) {
        current.removeEventListener('scroll', containerOnScroll);
      }
    };
  }, [containerRef, skip]);

  /**
   * Handle messages
   */
  useEffect(() => {
    const setRoomMessage = ({ data }: SendMessageArgs<MessageType.SET_ROOM_MESSAGE>) => {
      if (messages) {
        const _messages = messages.map((item) => item);
        _messages.push(data);
        setMessages(_messages);
        if (data.text === message) {
          setMessage('');
        }
        if (containerRef.current && data.unitId === userId.toString()) {
          setMyMessage(!myMessage);
        }
      }
    };
    ws.onOpen = () => {
      ws.sendMessage({
        id: roomId,
        type: MessageType.GET_CHAT_UNIT,
        connId: '',
        data: {
          userId,
        },
      });
    };
    ws.onMessage = (ev) => {
      const { data } = ev;
      const rawMessage = ws.parseMessage(data);
      if (!rawMessage) {
        return;
      }
      const { type } = rawMessage;
      switch (type) {
        case MessageType.SET_ROOM_MESSAGE:
          setRoomMessage(rawMessage);
          break;
        case MessageType.SET_CHAT_MESSAGES:
          setChatMessagesHandler(rawMessage);
          break;
        case MessageType.SET_CHAT_UNIT:
          setChatUnit(true);
          break;
        default:
      }
    };
    ws.onError = (e) => {
      log('error', 'Error chat', { e });
    };
    ws.onClose = () => {
      log('warn', 'Chat connection closed', {});
    };
    return () => {
      ws.onOpen = () => {
        /** */
      };
      ws.onMessage = () => {
        /** */
      };
      ws.onError = () => {
        /** */
      };
      ws.onClose = () => {
        /** */
      };
    };
  }, [roomId, userId, ws, messages, message, myMessage, containerRef]);
  return { changeText, sendMessage, messages, message };
};