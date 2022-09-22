/******************************************************************************************
 * Repository: https://github.com/kolserdav/werift-sfu-react.git
 * File name: Main.tsx
 * Author: Sergey Kolmiller
 * Email: <uyem.ru@gmail.com>
 * License: MIT
 * License text: See in LICENSE file
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Wed Aug 24 2022 14:14:09 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useMemo } from 'react';
import clsx from 'clsx';
import Room from './components/Room';
import Hall from './components/Hall';
import { GlobalProps } from './types';
import { getPathname, getRoomId } from './utils/lib';
import ChevronLeftIcon from './Icons/ChevronLeftIcon';
import ChevronRightIcon from './Icons/ChevronRightIcon';
import IconButton from './components/ui/IconButton';
import Alert from './components/ui/Alert';
import s from './Main.module.scss';
import { useListeners } from './Main.hooks';
import { USER_NAME_DEFAULT } from './utils/constants';

function Main({
  port,
  server,
  colors,
  userId,
  token = '',
  name = USER_NAME_DEFAULT,
}: Omit<GlobalProps, 'locale' | 'roomId'>) {
  const pathname = getPathname();
  const roomId = useMemo(() => getRoomId(pathname || ''), [pathname]);
  const { locale, openMenu, theme, alert, hallOpen } = useListeners({ colors, port, server });

  return (
    <div className={s.wrapper}>
      {locale && (
        <Room
          port={port}
          userId={userId}
          server={server}
          colors={colors}
          theme={theme}
          roomId={roomId}
          locale={locale}
        />
      )}
      <div
        className={clsx(s.button, hallOpen ? s.active : '')}
        role="button"
        style={theme?.button}
        tabIndex={0}
        onClick={openMenu}
      >
        <IconButton strict className={clsx(s.button__icon, hallOpen ? s.active : '')}>
          {hallOpen ? (
            <ChevronRightIcon color={theme?.colors.paper} />
          ) : (
            <ChevronLeftIcon color={theme?.colors.paper} />
          )}
        </IconButton>
      </div>
      {locale && (
        <Hall
          roomId={roomId}
          userId={userId}
          open={hallOpen}
          locale={locale}
          server={server}
          port={port}
          theme={theme}
          token={token}
          name={name}
        />
      )}
      <Alert open={alert.open} type={alert.type} theme={theme}>
        {alert.children}
      </Alert>
    </div>
  );
}

export default Main;
