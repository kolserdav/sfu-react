/******************************************************************************************
 * Repository: https://github.com/kolserdav/werift-sfu-react.git
 * File name: Chat.hooks.ts
 * Author: Sergey Kolmiller
 * Email: <uyem.ru@gmail.com>
 * License: MIT
 * License text: See in LICENSE file
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Wed Aug 24 2022 14:14:09 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/
import React, { useEffect, useState, useMemo } from 'react';
import WS from '../core/ws';
import { log } from '../utils/lib';
import { MessageType, SendMessageArgs } from '../types/interfaces';
import {
  CHAT_TAKE_MESSAGES,
  TEXT_AREA_MAX_ROWS,
  DIALOG_DEFAULT,
  CLICK_POSITION_DEFAULT,
} from '../utils/constants';
import { ClickPosition, DialogProps } from '../types';
import { scrollToBottom } from './Chat.lib';
import storeAlert, { changeAlert } from '../store/alert';
import storeClickDocument from '../store/clickDocument';

let oldSkip = 0;
// eslint-disable-next-line import/prefer-default-export
export const useMesages = ({
  port,
  server,
  roomId,
  userId,
  containerRef,
  inputRef,
}: {
  port: number;
  server: string;
  roomId: string | number;
  userId: string | number;
  containerRef: React.RefObject<HTMLDivElement>;
  inputRef: React.RefObject<HTMLTextAreaElement>;
}) => {
  const [message, setMessage] = useState<string>('');
  const [chatUnit, setChatUnit] = useState<boolean>(false);
  const [myMessage, setMyMessage] = useState<boolean>(false);
  const [skip, setSkip] = useState<number>(0);
  const [count, setCount] = useState<number>(0);
  const [rows, setRows] = useState<number>(1);

  const [messages, setMessages] = useState<
    SendMessageArgs<MessageType.SET_CHAT_MESSAGES>['data']['result']
  >([]);

  const ws = useMemo(
    () => new WS({ server, port: port.toString(), shareScreen: false }),
    [port, server]
  );

  const changeText = (e: React.FormEvent<HTMLTextAreaElement>) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { target }: any = e;
    const { value } = target;
    let c = 1;
    for (let i = 0; value[i]; i++) {
      if (value[i] === '\n') {
        c++;
      }
    }
    if (c <= TEXT_AREA_MAX_ROWS) {
      setRows(c);
    }
    setMessage(value);
  };

  const sendMessage = useMemo(
    () => () => {
      const mess = message.replace(/[\n\s]+/g, '');
      if (mess) {
        ws.sendMessage({
          type: MessageType.GET_ROOM_MESSAGE,
          connId: '',
          id: roomId,
          data: {
            message,
            userId,
          },
        });
      } else {
        setRows(1);
        setMessage(mess);
      }
    },
    [message, userId, roomId, ws]
  );

  useEffect(() => {
    if (containerRef.current) {
      scrollToBottom(containerRef.current);
    }
  }, [rows, containerRef]);

  /**
   * Container scroll handler
   */
  useEffect(() => {
    const { current } = containerRef;
    const containerOnScroll = () => {
      if (current) {
        if (current.scrollTop === 0 && count > messages.length) {
          setSkip(skip + CHAT_TAKE_MESSAGES);
          current.scrollTo({ top: 1 });
        }
      }
    };
    if (current) {
      if (current.clientTop === 0) {
        current.scrollTo({ top: 1 });
      }
      current.addEventListener('scroll', containerOnScroll);
    }
    return () => {
      if (current) {
        current.removeEventListener('scroll', containerOnScroll);
      }
    };
  }, [containerRef, skip, count, messages]);

  /**
   * Get first chat messages
   */
  useEffect(() => {
    if (chatUnit && skip - oldSkip !== 1) {
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
    oldSkip = skip;
  }, [ws, roomId, chatUnit, userId, skip]);

  /**
   * Scroll to my new message
   */
  useEffect(() => {
    if (containerRef.current) {
      scrollToBottom(containerRef.current);
    }
  }, [myMessage, containerRef]);

  /**
   * Listen input Enter
   */
  useEffect(() => {
    const { current } = inputRef;
    const onPressButton = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        sendMessage();
      }
    };
    if (current) {
      current.addEventListener('keypress', onPressButton);
    }
    return () => {
      if (current) {
        current.removeEventListener('keypress', onPressButton);
      }
    };
  }, [inputRef, sendMessage, message]);

  /**
   * Handle messages
   */
  useEffect(() => {
    const setChatMessagesHandler = ({
      data: { result, count: _count },
    }: SendMessageArgs<MessageType.SET_CHAT_MESSAGES>) => {
      let _result = [];
      for (let i = result.length - 1; i >= 0; i--) {
        _result.push(result[i]);
      }
      if (messages) {
        _result = _result.concat(messages);
      }
      setCount(_count);
      setMessages(_result);
    };

    const setErrorHandler = ({
      data: { message: children },
    }: SendMessageArgs<MessageType.SET_ERROR>) => {
      storeAlert.dispatch(
        changeAlert({
          alert: {
            open: true,
            children,
            type: 'error',
          },
        })
      );
    };

    const setRoomMessage = ({ data }: SendMessageArgs<MessageType.SET_ROOM_MESSAGE>) => {
      if (messages) {
        const _messages = messages.map((item) => item);
        _messages.push(data);
        setMessages(_messages);
        if (data.unitId === userId.toString()) {
          setMyMessage(!myMessage);
          setMessage('');
          setRows(1);
        }
        setSkip(skip + 1);
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
        case MessageType.SET_ERROR:
          setErrorHandler(rawMessage);
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
  }, [roomId, userId, ws, messages, message, myMessage, containerRef, skip]);
  return { changeText, sendMessage, messages, message, rows };
};

export const useDialog = () => {
  const [dialog, setDialog] = useState<Omit<DialogProps, 'children'>>(DIALOG_DEFAULT);
  const [position, setPosition] = useState<ClickPosition>(CLICK_POSITION_DEFAULT);
  const messageContextHandler = (ev: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    ev.preventDefault();
    const { clientX, clientY } = ev;
    setDialog({
      open: true,
      clientY,
      clientX,
    });
    setPosition({
      clientX,
      clientY,
    });
  };

  /**
   * Listen click document
   */
  useEffect(() => {
    const cleanStore = storeClickDocument.subscribe(() => {
      // TODO check area
      const {
        clickDocument: { clientX, clientY },
      } = storeClickDocument.getState();
      setDialog({
        open: false,
        clientY: position.clientX,
        clientX: position.clientY,
      });
    });
    return () => {
      cleanStore();
    };
  }, [position]);

  return { dialog, messageContextHandler };
};
