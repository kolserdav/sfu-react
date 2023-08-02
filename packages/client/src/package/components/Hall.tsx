/******************************************************************************************
 * Repository: https://github.com/kolserdav/werift-sfu-react.git
 * File name: Hall.tsx
 * Author: Sergey Kolmiller
 * Email: <kolserdav@uyem.ru>
 * License: MIT
 * License text: See in LICENSE file
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Wed Aug 02 2023 23:56:49 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/
import React from 'react';
import clsx from 'clsx';
import { HallProps } from '../types';
import Chat from './Chat';
import CloseIcon from '../Icons/Close';
import s from './Hall.module.scss';
import IconButton from './ui/IconButton';
import SettingsIcon from '../Icons/SettingsIcon';
import { useSettings, useUserList } from './Hall.hooks';
import Settings from './Settings';
import UsersIcon from '../Icons/Users';
import Users from './Users';

function Hall({
  open,
  locale,
  server,
  port,
  roomId,
  userId,
  theme,
  token,
  name,
  backLinks,
  videoRecord,
}: HallProps) {
  const { openSettings, openSettingsDialog } = useSettings({ open });
  const { openUserList, openUserListHandler } = useUserList({ open });

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
          <Users
            open={openUserList}
            theme={theme}
            locale={locale}
            backLinks={backLinks}
            userId={userId}
            roomId={roomId}
          />
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
            open={openSettings}
            server={server}
            port={port}
            videoRecord={videoRecord}
          />
          {open && !openSettings && (
            <IconButton
              onClick={openUserListHandler}
              className={clsx(s.userlist__button, openUserList ? s.open : '')}
            >
              {openUserList ? (
                <CloseIcon color={theme?.colors.text} />
              ) : (
                <UsersIcon color={theme?.colors.text} />
              )}
            </IconButton>
          )}
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
