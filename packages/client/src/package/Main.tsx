/******************************************************************************************
 * Repository: https://github.com/kolserdav/werift-sfu-react.git
 * File name: Main.tsx
 * Author: Sergey Kolmiller
 * Email: <uyem.ru@gmail.com>
 * License: MIT
 * License text: See in LICENSE file
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Fri Jul 29 2022 21:35:51 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useEffect, useState, useMemo } from 'react';
import clsx from 'clsx';
import Room from './components/Room';
import Hall from './components/Hall';
import { RoomProps } from './types';
import ThemeContext from './Theme.context';
import { themes, Themes } from './Theme';
import ChevronLeftIcon from './Icons/ChevronLeftIcon';
import ChevronRightIcon from './Icons/ChevronRightIcon';
import { changeColors } from './Main.lib';
import s from './Main.module.scss';
import IconButton from './components/ui/IconButton';
import { getLocale, getRoomId, getPathname } from './utils/lib';
import storeTheme from './store/theme';
import storeLocale from './store/locale';
import { LocaleClient } from './types/interfaces';
import { getLocalStorage, LocalStorageName, setLocalStorage } from './utils/localStorage';

function Main({ room }: { room: Omit<RoomProps, 'locale' | 'roomId'> }) {
  const pathname = getPathname();
  const roomId = useMemo(() => getRoomId(pathname || ''), [pathname]);
  const { colors } = room;
  const savedTheme = getLocalStorage(LocalStorageName.THEME);
  const [currentTheme, setCurrentTheme] = useState<keyof Themes>(savedTheme || 'light');
  const _themes = useMemo(() => changeColors({ colors, themes }), [colors]);
  const [theme, setTheme] = useState<Themes['dark' | 'light']>(_themes[savedTheme || 'light']);
  const [hallOpen, setHallOpen] = useState<boolean>(
    getLocalStorage(LocalStorageName.HALL_OPEN) || false
  );
  const [locale, setLocale] = useState<LocaleClient | null>(null);

  const openMenu = () => {
    setLocalStorage(LocalStorageName.HALL_OPEN, !hallOpen);
    setHallOpen(!hallOpen);
  };

  /**
   * Set theme
   */
  useEffect(() => {
    setTheme(_themes[currentTheme]);
  }, [currentTheme, _themes]);

  /**
   * Change locale
   */
  useEffect(() => {
    // TODO change to saved locale
    let _locale = getLocale(storeLocale.getState().locale);
    setLocale(_locale);
    storeLocale.subscribe(() => {
      const state = storeLocale.getState();
      _locale = getLocale(state.locale);
      setLocale(_locale);
    });
  }, []);

  /**
   * Change theme
   */
  useEffect(() => {
    const cleanSubs = storeTheme.subscribe(() => {
      const { theme: _theme } = storeTheme.getState();
      setCurrentTheme(_theme);
    });
    return () => {
      cleanSubs();
    };
  }, []);

  return (
    <ThemeContext.Provider value={theme}>
      {locale && <Room {...room} roomId={roomId} locale={locale.room} />}
      <div
        className={clsx(s.button, hallOpen ? s.active : '')}
        role="button"
        style={theme.button}
        tabIndex={0}
        onClick={openMenu}
      >
        <IconButton className={clsx(s.button__icon, hallOpen ? s.active : '')}>
          {hallOpen ? (
            <ChevronRightIcon color={theme.colors.paper} />
          ) : (
            <ChevronLeftIcon color={theme.colors.paper} />
          )}
        </IconButton>
      </div>
      {locale && (
        <Hall
          roomId={roomId}
          userId={room.id}
          open={hallOpen}
          locale={locale.hall}
          server={room.server}
          port={room.port}
        />
      )}
    </ThemeContext.Provider>
  );
}

export default Main;
