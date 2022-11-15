/******************************************************************************************
 * Repository: https://github.com/kolserdav/werift-sfu-react.git
 * File name: Chat.tsx
 * Author: Sergey Kolmiller
 * Email: <uyem.ru@gmail.com>
 * License: MIT
 * License text: See in LICENSE file
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Wed Aug 24 2022 14:14:09 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/
import React, { useRef } from 'react';
import clsx from 'clsx';
import s from './Chat.module.scss';
import g from '../Global.module.scss';
import SendIcon from '../Icons/Send';
import IconButton from './ui/IconButton';
import { useMesages, useDialog, useScrollToQuote, useRoomIsInactive } from './Chat.hooks';
import { dateToTime, dateToString, isMobile, dateToDateTime } from '../utils/lib';
import { prepareMessage, getShortMess } from './Chat.lib';
import Dialog from './ui/Dialog';
import { ChatProps } from '../types';
import CheckIcon from '../Icons/Check';
import CloseIcon from '../Icons/Close';
import { useIsOwner } from '../utils/hooks';

function Chat({ server, port, roomId, userId, locale, theme }: ChatProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { isOwner } = useIsOwner({ userId });

  const {
    blocked,
    message,
    messages,
    changeText,
    sendMessage,
    rows,
    clickQuoteWrapper,
    clickEditWrapper,
    clickDeleteWrapper,
    error,
    editMessage,
    quoteMessage,
    onClickCloseEditMessage,
    clickBlockChatWrapper,
    textAreaLeft,
  } = useMesages({
    port,
    server,
    userId,
    roomId,
    containerRef,
    inputRef,
    locale,
  });
  const { dialog, messageContextWrapper } = useDialog();
  useScrollToQuote({ messages, containerRef });
  const roomIsInactive = useRoomIsInactive();

  return (
    <div className={s.wrapper} style={{ background: theme?.colors.active }}>
      <div
        className={s.container}
        ref={containerRef}
        id="messages"
        style={{ height: `calc(90% - ${rows} * ${isMobile() ? '0.5rem' : '1rem'})` }}
      >
        {messages.length ? (
          messages.map((item, index) => (
            <div className={s.message__wrapper} key={item.id} id={item.id.toString()}>
              {new Date(item.created).getDay() !==
                new Date(messages[index - 1]?.created).getDay() && (
                <p className={s.day}>{dateToString(new Date(item.created))}</p>
              )}
              <div
                onContextMenu={messageContextWrapper(item, item.unitId === userId.toString())}
                style={{ background: theme?.colors.paper, color: theme?.colors.text }}
                className={clsx(s.message, item.unitId === userId.toString() ? s.self : '')}
              >
                {item.unitId !== userId.toString() && (
                  <div className={s.name}>
                    <span className={s.name__text}>{item.Unit.name}</span>
                    {item.unitId === item.Unit.id && (
                      <span className={s.role}>{locale.shortAdmin}</span>
                    )}
                  </div>
                )}
                {item.Quote && (
                  <a className={s.quote__link} href={`#${item.Quote.MessageQuote?.id || ''}`}>
                    <div className={s.quote}>
                      <div className={s.name}>{item.Quote.MessageQuote?.Unit.name}</div>
                      <div
                        className={clsx(
                          s.text,
                          item.Quote.MessageQuote?.text === undefined ? s.disabled : ''
                        )}
                      >
                        {getShortMess(item.Quote.MessageQuote?.text || locale.messageDeleted)}
                      </div>
                    </div>
                  </a>
                )}
                <div
                  className={s.text}
                  dangerouslySetInnerHTML={{ __html: prepareMessage(item.text) }}
                />
                <div className={s.date}>
                  {item.created !== item.updated ? (
                    <span className={s.edited}>{locale.edited}</span>
                  ) : (
                    ''
                  )}
                  {item.created !== item.updated
                    ? dateToDateTime(new Date(item.updated))
                    : dateToTime(new Date(item.created))}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className={s.no__messages}>{error ? locale.noMessages : locale.loading}</div>
        )}
      </div>
      <div className={s.input}>
        {(editMessage || quoteMessage) && (
          <div className={s.info}>
            <div
              className={s.block}
              style={{ backgroundColor: theme?.colors.paper, left: textAreaLeft() }}
            >
              <span>{editMessage ? locale.editMessage : locale.quote}</span>
              {quoteMessage && <span>: {getShortMess(quoteMessage.text)}</span>}
              <IconButton onClick={onClickCloseEditMessage}>
                <CloseIcon width={24} height={24} color={theme?.colors.text} />
              </IconButton>
            </div>
          </div>
        )}
        <div className={s.group}>
          <textarea
            style={{
              background: theme?.colors.paper,
              color: theme?.colors.text,
              cursor: roomIsInactive ? 'not-allowed' : 'inherit',
            }}
            rows={rows}
            ref={inputRef}
            onInput={changeText}
            value={message}
            disabled={roomIsInactive || blocked}
            placeholder={blocked ? locale.chatBlocked : ''}
          />
          <IconButton
            id="send-message"
            disabled={roomIsInactive || blocked}
            className={s.send__icon}
            title={locale.send}
            onClick={sendMessage}
          >
            {editMessage ? (
              <CheckIcon color={theme?.colors.text} />
            ) : (
              <SendIcon color={theme?.colors.text} />
            )}
          </IconButton>
        </div>
      </div>
      <Dialog {...dialog} theme={theme}>
        <div className={s.message__dialog}>
          {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events */}
          <div
            tabIndex={-1}
            role="button"
            onClick={clickQuoteWrapper(dialog.context)}
            className={g.dialog__item}
          >
            {locale.quote}
          </div>
          {dialog.secure && (
            // eslint-disable-next-line jsx-a11y/click-events-have-key-events
            <div
              tabIndex={-2}
              role="button"
              onClick={clickEditWrapper(dialog.context)}
              className={g.dialog__item}
            >
              {locale.edit}
            </div>
          )}
          {(dialog.secure || isOwner) && (
            // eslint-disable-next-line jsx-a11y/click-events-have-key-events
            <div
              tabIndex={-3}
              role="button"
              onClick={clickDeleteWrapper(dialog.context)}
              className={g.dialog__item}
            >
              {locale.delete}
            </div>
          )}
          {isOwner && (
            // eslint-disable-next-line jsx-a11y/click-events-have-key-events
            <div
              tabIndex={-4}
              role="button"
              onClick={clickBlockChatWrapper(dialog.context)}
              className={g.dialog__item}
            >
              {locale.blockChat}
            </div>
          )}
        </div>
      </Dialog>
    </div>
  );
}
export default Chat;
