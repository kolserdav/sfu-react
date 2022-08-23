import React, { useContext, useEffect, useMemo, useState } from 'react';
import ThemeContext from '../Theme.context';
import s from './Chat.module.scss';
import SendIcon from '../Icons/Send';
import IconButton from './ui/IconButton';
import WS from '../core/ws';
import { log } from '../utils/lib';
import { MessageType, SendMessageArgs } from '../types/interfaces';

function Chat({
  server,
  port,
  roomId,
  userId,
}: {
  server: string;
  port: number;
  roomId: string | number;
  userId: string | number;
}) {
  const theme = useContext(ThemeContext);
  const [message, setMessage] = useState<string>('');
  const [chatUnit, setChatUnit] = useState<boolean>(false);
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
    ws.sendMessage({
      type: MessageType.GET_ROOM_MESSAGE,
      connId: '',
      id: roomId,
      data: {
        message,
        userId,
      },
    });
  };

  const setChatMessagesHandler = ({
    data: { result },
  }: SendMessageArgs<MessageType.SET_CHAT_MESSAGES>) => {
    setMessages(result);
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
          },
        },
      });
    }
  }, [ws, roomId, chatUnit, userId]);

  /**
   * Handle messages
   */
  useEffect(() => {
    const setRoomMessage = ({ data }: SendMessageArgs<MessageType.SET_ROOM_MESSAGE>) => {
      if (messages) {
        const _messages = messages.map((item) => item);
        _messages.push(data);
        setMessages(_messages);
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
  }, [roomId, userId, ws, messages]);

  return (
    <div className={s.wrapper} style={{ background: theme.colors.paper }}>
      <div className={s.container}>
        {messages &&
          messages.map((item) => (
            <div
              style={{ background: theme.colors.active, color: theme.colors.textActive }}
              key={item.id}
              className={s.message}
            >
              {item.text}
            </div>
          ))}
      </div>
      <div className={s.input}>
        <input onInput={changeText} value={message} />
        <IconButton onClick={sendMessage}>
          <SendIcon color={theme.colors.text} />
        </IconButton>
      </div>
    </div>
  );
}
export default Chat;
