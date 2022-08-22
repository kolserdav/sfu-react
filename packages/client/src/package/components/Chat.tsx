import React, { useContext, useEffect, useMemo, useState } from 'react';
import ThemeContext from '../Theme.context';
import s from './Chat.module.scss';
import SendIcon from '../Icons/Send';
import IconButton from './ui/IconButton';
import WS from '../core/ws';
import { log } from '../utils/lib';
import { MessageType } from '../types/interfaces';

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
      type: MessageType.SET_ROOM_MESSAGE,
      connId: '',
      id: roomId,
      data: {
        message,
        userId,
      },
    });
  };

  /**
   * Handle messages
   */
  useEffect(() => {
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
          console.log(rawMessage);
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
  }, []);

  return (
    <div className={s.wrapper} style={{ background: theme.colors.paper }}>
      <div className={s.container}>Chat</div>
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
