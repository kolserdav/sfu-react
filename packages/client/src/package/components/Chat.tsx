import React, { useContext, useRef } from 'react';
import clsx from 'clsx';
import ThemeContext from '../Theme.context';
import s from './Chat.module.scss';
import SendIcon from '../Icons/Send';
import IconButton from './ui/IconButton';
import { useMesages } from './Chat.hooks';
import { dateToTime, dateToString } from '../utils/lib';

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

  const containerRef = useRef<HTMLDivElement>(null);
  const { message, messages, changeText, sendMessage } = useMesages({
    port,
    server,
    userId,
    roomId,
    containerRef,
  });

  return (
    <div className={s.wrapper} style={{ background: theme.colors.paper }}>
      <div className={s.container} ref={containerRef}>
        {messages &&
          messages.map((item, index) => (
            <React.Fragment key={item.id}>
              {new Date(item.created).getDate() !==
                new Date(messages[index - 1]?.created).getDate() && (
                <p className={s.day}>{dateToString(new Date(item.created))}</p>
              )}
              <div
                style={{ background: theme.colors.active, color: theme.colors.textActive }}
                className={clsx(s.message, item.unitId === userId.toString() ? s.self : '')}
              >
                <div className={s.text}>{item.text}</div>
                <div className={s.date}>{dateToTime(new Date(item.created))}</div>
              </div>
            </React.Fragment>
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
