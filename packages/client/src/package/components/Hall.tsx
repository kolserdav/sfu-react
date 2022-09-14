/******************************************************************************************
 * Repository: https://github.com/kolserdav/werift-sfu-react.git
 * File name: Hall.tsx
 * Author: Sergey Kolmiller
 * Email: <uyem.ru@gmail.com>
 * License: MIT
 * License text: See in LICENSE file
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Wed Aug 24 2022 14:14:09 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/
import React from 'react';
import clsx from 'clsx';
import { HallProps } from '../types';
import Chat from './Chat';
import CloseIcon from '../Icons/Close';
import s from './Hall.module.scss';
import IconButton from './ui/IconButton';
import SettingsIcon from '../Icons/SettingsIcon';
import { useSettings, useUsers } from './Hall.hooks';
import MicrophoneOffIcon from '../Icons/MicrophoneOffIcon';
import { checkIsRecord } from '../utils/lib';
import Settings from './Settings';

function Hall({ open, locale, server, port, roomId, userId, theme, token, name }: HallProps) {
  const { openSettings, openSettingsDialog } = useSettings({ open });
  const { users, isOwner, banneds, unBanWrapper } = useUsers({ userId, roomId });

  return (
    <div className={clsx(s.wrapper, open ? s.open : '')}>
      <div
        className={s.container}
        style={{
          background: theme?.colors.paper,
          color: theme?.colors.text,
        }}
      >
        <div className={s.block}>
          <div className={s.users} style={{ color: theme?.colors.text }}>
            {users.map((item) =>
              checkIsRecord(item.id.toString()) ? (
                ''
              ) : (
                <div key={item.id} className={s.users__item}>
                  <div className={s.user__name}>{item.name}</div>
                  <div className={s.user__actions}>
                    {(item.muted || item.adminMuted) && (
                      <MicrophoneOffIcon
                        width={16}
                        height={16}
                        color={
                          !item.adminMuted
                            ? theme?.colors.text
                            : isOwner
                            ? theme?.colors.blue
                            : theme?.colors.text
                        }
                      />
                    )}
                  </div>
                </div>
              )
            )}
            {isOwner && banneds.length !== 0 && (
              <div className={s.users}>
                <div className={s.title}>{locale.banneds}</div>
                {banneds.map((item) => (
                  <div key={`${item.id}-ban`} className={s.users__item}>
                    <div className={s.users__name}>{item.name}</div>
                    <div className={s.users__actions}>
                      <IconButton onClick={unBanWrapper(item.id)}>
                        <CloseIcon width={16} height={16} color={theme?.colors.red} />
                      </IconButton>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <Chat
            theme={theme}
            locale={locale}
            userId={userId}
            roomId={roomId}
            server={server}
            port={port}
            name={name}
            token={token}
          />
          <Settings
            token={token}
            name={name}
            theme={theme}
            locale={locale}
            userId={userId}
            roomId={roomId}
            isOwner={isOwner}
            open={openSettings}
            server={server}
            port={port}
          />
          {open && (
            <IconButton onClick={openSettingsDialog} className={s.settings__button}>
              {openSettings ? (
                <CloseIcon color={theme?.colors.text} />
              ) : (
                <SettingsIcon color={theme?.colors.text} />
              )}
            </IconButton>
          )}
        </div>
      </div>
    </div>
  );
}

export default Hall;
