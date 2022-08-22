import React, { useContext, useEffect, useMemo, useState } from 'react';
import ThemeContext from '../Theme.context';
import s from './Chat.module.scss';
import SendIcon from '../Icons/Send';
import IconButton from './ui/IconButton';
import WS from '../core/ws';
import { log } from '../utils/lib';

function Chat({ server, port }: { server: string; port: number }) {
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
    console.log(message);
  };

  /**
   * Handle messages
   */
  useEffect(() => {
    ws.onOpen = () => {
      /** */
    };
    ws.onMessage = (ev) => {
      const { data } = ev;
      const rawMessage = ws.parseMessage(data);
      if (!rawMessage) {
        return;
      }
      console.log(rawMessage);
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
