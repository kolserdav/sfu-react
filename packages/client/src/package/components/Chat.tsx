import React, { useContext, useRef } from 'react';
import clsx from 'clsx';
import ThemeContext from '../Theme.context';
import s from './Chat.module.scss';
import SendIcon from '../Icons/Send';
import IconButton from './ui/IconButton';
import { useMesages } from './Chat.hooks';
import { dateToTime, dateToString } from '../utils/lib';
import { prepareMessage } from './Chat.lib';
import { LocaleClient } from '../types/interfaces';

function Chat({
  server,
  port,
  roomId,
  userId,
  locale,
}: {
  server: string;
  port: number;
  roomId: string | number;
  userId: string | number;
  locale: LocaleClient['hall'];
}) {
  const theme = useContext(ThemeContext);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { message, messages, changeText, sendMessage, rows } = useMesages({
    port,
    server,
    userId,
    roomId,
    containerRef,
    inputRef,
  });
  return (
    <div className={s.wrapper} style={{ background: theme.colors.paper }}>
      <div
        className={s.container}
        ref={containerRef}
        style={{ height: `calc(90% - ${rows} * 3rem)` }}
      >
        {messages &&
          messages.map((item, index) => (
            <React.Fragment key={item.id}>
              {new Date(item.created).getDay() !==
                new Date(messages[index - 1]?.created).getDay() && (
                <p className={s.day}>{dateToString(new Date(item.created))}</p>
              )}
              <div
                style={{ background: theme.colors.active, color: theme.colors.textActive }}
                className={clsx(s.message, item.unitId === userId.toString() ? s.self : '')}
              >
                <div
                  className={s.text}
                  dangerouslySetInnerHTML={{ __html: prepareMessage(item.text) }}
                />
                <div className={s.date}>{dateToTime(new Date(item.created))}</div>
              </div>
            </React.Fragment>
          ))}
      </div>
      <div className={s.input}>
        <textarea rows={rows} ref={inputRef} onInput={changeText} value={message} />
        <IconButton title={locale.send} onClick={sendMessage}>
          <SendIcon color={theme.colors.text} />
        </IconButton>
      </div>
    </div>
  );
}
export default Chat;
