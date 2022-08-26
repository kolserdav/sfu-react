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
import React, { useEffect, useState, useMemo, useRef } from 'react';
import WS from '../core/ws';
import { getUTCDate, log } from '../utils/lib';
import { MessageFull, MessageType, SendMessageArgs } from '../types/interfaces';
import {
  CHAT_TAKE_MESSAGES,
  TEXT_AREA_MAX_ROWS,
  DIALOG_DEFAULT,
  CLICK_POSITION_DEFAULT,
  CONTEXT_DEFAULT,
  FIRST_MESSAGE_INDENT,
  FOLOW_QUOTE_STYLE,
} from '../utils/constants';
import { ClickPosition, DialogProps } from '../types';
import {
  checkQuote,
  cleanQuote,
  scrollToBottom,
  scrollToTop,
  scrollTo,
  getQuoteContext,
  checkEdit,
  getEditableMess,
  cleanEdit,
} from './Chat.lib';
import storeAlert, { changeAlert } from '../store/alert';
import storeClickDocument from '../store/clickDocument';

let oldSkip = 0;
let scrolled = false;
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
  const [isEdit, setIsEdit] = useState<boolean>(false);
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
    let _value = (value as string).slice();
    const { current } = inputRef;
    const quote = checkQuote(value);
    if (current) {
      if (current.selectionStart <= quote) {
        _value = cleanQuote(value);
      }
    }
    let c = 1;
    for (let i = 0; _value[i]; i++) {
      if (_value[i] === '\n') {
        c++;
      }
    }
    if (c <= TEXT_AREA_MAX_ROWS) {
      setRows(c);
    } else {
      setRows(TEXT_AREA_MAX_ROWS);
    }
    const _isEdit = checkEdit(_value);
    if (_isEdit && !isEdit) {
      setIsEdit(true);
    } else if (!isEdit && isEdit) {
      setIsEdit(false);
    }
    setMessage(_value);
  };

  const clickQuoteWrapper =
    (context: string) => (ev: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      const quote = `[quote=${getQuoteContext(JSON.parse(context))}]\n`;
      setMessage(`${quote}${message}`);
      const { current } = inputRef;
      if (current) {
        current.select();
        current.selectionStart = quote.length;
      }
    };

  const clickEditWrapper =
    (context: string) => (ev: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      const { text, id } = JSON.parse(context);
      const edit = `[edit=${id}]\n`;
      const _message = `${edit}${text}`;
      setMessage(_message);
      const { current } = inputRef;
      if (current) {
        current.select();
        current.selectionStart = _message.length;
      }
    };

  const sendMessage = useMemo(
    () => () => {
      const mess = message.replace(/[\n\s]+/g, '');
      // if message is not empty
      if (mess) {
        if (checkEdit(message)) {
          const id = getEditableMess(message);
          ws.sendMessage({
            type: MessageType.GET_EDIT_MESSAGE,
            connId: '',
            id: roomId,
            data: {
              args: {
                where: {
                  id,
                },
                data: {
                  text: cleanEdit(message),
                  updated: new Date(),
                },
              },
              userId,
            },
          });
        } else {
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
      } else {
        setRows(1);
        setMessage(mess);
      }
    },
    [message, userId, roomId, ws]
  );

  /**
   * Scroll by load
   */
  useEffect(() => {
    const { current } = containerRef;
    if (current && !scrolled) {
      scrollToBottom(current);
    }
  }, [containerRef, messages]);

  /**
   * Scroll by new message
   */
  useEffect(() => {
    const { current } = containerRef;
    if (current) {
      scrollToBottom(current);
    }
  }, [myMessage, containerRef]);

  /**
   * Container scroll handler
   */
  useEffect(() => {
    const { current } = containerRef;
    // TODO attention here
    const timeout = setTimeout(() => {
      scrolled = false;
    }, 1000);
    const containerOnScroll = () => {
      if (scrolled) {
        clearTimeout(timeout);
      }
      scrolled = true;
      if (current) {
        if (current.scrollTop === 0 && count > messages.length) {
          setSkip(skip + CHAT_TAKE_MESSAGES);
          scrollToTop(current);
        }
      }
    };
    if (current) {
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
            include: {
              Unit: {
                select: {
                  name: true,
                },
              },
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

    const setEditMessageHandler = ({ data }: SendMessageArgs<MessageType.SET_EDIT_MESSAGE>) => {
      const { id } = data;
      const _messages: MessageFull[] = [];
      for (let i = 0; messages[i]; i++) {
        const _message = messages[i];
        if (_message.id === id) {
          _messages.push(data);
        } else {
          _messages.push(_message);
        }
      }
      setIsEdit(false);
      setMessages(_messages);
      setMessage('');
      setRows(1);
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
        case MessageType.SET_EDIT_MESSAGE:
          setEditMessageHandler(rawMessage);
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
  return {
    changeText,
    sendMessage,
    messages,
    message,
    rows,
    clickQuoteWrapper,
    clickEditWrapper,
    count,
    isEdit,
  };
};

export const useDialog = () => {
  const [dialog, setDialog] = useState<Omit<DialogProps, 'children'>>(DIALOG_DEFAULT);
  const [position, setPosition] = useState<ClickPosition>(CLICK_POSITION_DEFAULT);
  const messageContextWrapper =
    (item: MessageFull, secure: boolean) => (ev: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      const { shiftKey } = ev;
      if (!shiftKey) {
        ev.preventDefault();
        const { clientX, clientY } = ev;
        const context = JSON.stringify(item);
        setDialog({
          open: true,
          clientY,
          clientX,
          context,
          secure,
        });
        setPosition({
          clientX,
          clientY,
        });
      }
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
        context: CONTEXT_DEFAULT,
        secure: false,
      });
    });
    return () => {
      cleanStore();
    };
  }, [position]);

  return { dialog, messageContextWrapper };
};

let gettingPosition = false;

export const useScrollToQuote = ({
  containerRef,
  messages,
  count,
}: {
  containerRef: React.RefObject<HTMLDivElement>;
  messages: SendMessageArgs<MessageType.SET_CHAT_MESSAGES>['data']['result'];
  count: number;
}) => {
  const mounted = useRef(false);
  useEffect(() => {
    mounted.current = true;
    const hashChangeHandler = async () => {
      const { hash } = window.location;
      const messIdStr = hash.replace('#', '');
      const messId = parseInt(messIdStr, 10);
      const { current } = containerRef;
      if (current && !Number.isNaN(messId)) {
        let position = 0;
        const getPosition = async () => {
          gettingPosition = true;
          const { children } = current;
          for (let i = 0; children[i]; i++) {
            const child = children[i];
            const { id } = child;
            if (id === messIdStr) {
              const { top } = child.getBoundingClientRect();
              const indent = top - FIRST_MESSAGE_INDENT;
              position = indent < 1 ? top : indent;
              const oldStyle = child.firstElementChild?.getAttribute('style');
              child.firstElementChild?.setAttribute('style', `${oldStyle}${FOLOW_QUOTE_STYLE}`);
              setTimeout(() => {
                child.firstElementChild?.setAttribute('style', oldStyle || '');
                window.location.hash = '';
              }, 3000);
              break;
            }
          }
          if (position !== 0) {
            gettingPosition = false;
            return position;
          }
          await new Promise((resolve) => {
            setTimeout(() => {
              resolve(0);
            }, 10);
          });
          position = await getPosition();
          return position;
        };
        let check = false;
        for (let i = 0; messages[i]; i++) {
          const { id } = messages[i];
          if (id === messId) {
            check = true;
            break;
          }
        }
        if (check) {
          const _position = await getPosition();
          position = 0;
          scrollTo(current, _position);
        } else if (!gettingPosition) {
          scrollTo(current, 0);
        } else {
          log('warn', 'Unecesary scroll quote case', { check, gettingPosition });
        }
      }
    };
    setTimeout(() => {
      hashChangeHandler();
    }, 0);
    const onHashChange = () => {
      hashChangeHandler();
    };
    window.addEventListener('hashchange', onHashChange);
    return () => {
      window.removeEventListener('hashchange', onHashChange);
      mounted.current = false;
    };
  }, [containerRef, messages]);

  return {};
};
