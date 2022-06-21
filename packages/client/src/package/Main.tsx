/******************************************************************************************
 * Repository: https://github.com/kolserdav/uyem.git
 * File name: Main.tsx
 * Author: Sergey Kolmiller
 * Email: <uyem.ru@gmail.com>
 * License: BSD-2-Clause
 * License text: Binary distributions of this software include 'wrtc' and other third-party libraries.
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Tue Jun 21 2022 08:49:55 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useEffect, useState } from 'react';
import clsx from 'clsx';
import Room from './components/Room';
import Hall from './components/Hall';
import { RoomProps } from './types';
import ThemeContext from './Theme.context';
import { themes, Themes } from './Theme';
import ChevronLeftIcon from './Icons/ChevronLeftIcon';
import ChevronRightIcon from './Icons/ChevronRightIcon';
import s from './Main.module.scss';
import IconButton from './components/ui/IconButton';
import storeTheme from './store/theme';

// TODO theme provider
function Main({ id }: RoomProps) {
  const [currentTheme, setCurrentTheme] = useState<keyof Themes>('light');
  const [theme, setTheme] = useState<Themes['dark' | 'light']>(themes.light);
  const [hallOpen, setHallOpen] = useState<boolean>(false);

  const openMenu = () => {
    setHallOpen(!hallOpen);
  };

  useEffect(() => {
    setTheme(themes[currentTheme]);
  }, [currentTheme]);

  useEffect(() => {
    const cleanSubs = storeTheme.subscribe(() => {
      const { theme: _theme } = storeTheme.getState();
      console.log(theme);
      setCurrentTheme(_theme);
    });
    return () => {
      cleanSubs();
    };
  }, []);

  return (
    <ThemeContext.Provider value={theme}>
      <Room id={id} />
      <div
        className={clsx(s.button, hallOpen ? s.active : '')}
        role="button"
        style={theme.button}
        tabIndex={0}
        onClick={openMenu}
      >
        <IconButton className={clsx(s.button__icon, hallOpen ? s.active : '')}>
          {hallOpen ? (
            <ChevronRightIcon color={theme.colors.shadow} />
          ) : (
            <ChevronLeftIcon color={theme.colors.shadow} />
          )}
        </IconButton>
      </div>
      <Hall open={hallOpen} />
    </ThemeContext.Provider>
  );
}

export default Main;
