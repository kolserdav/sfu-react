/******************************************************************************************
 * Repository: https://github.com/kolserdav/react-node-webrtc-sfu.git
 * File name: Main.tsx
 * Author: Sergey Kolmiller
 * Email: <uyem.ru@gmail.com>
 * License: MIT
 * License text: 
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Thu Jul 14 2022 16:24:49 GMT+0700 (Krasnoyarsk Standard Time)
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
import storeTheme from './store/theme';

// TODO theme provider
function Main({ room }: { room: RoomProps }) {
  const { colors } = room;
  const [currentTheme, setCurrentTheme] = useState<keyof Themes>('light');
  const _themes = useMemo(() => changeColors({ colors, themes }), [colors]);
  const [theme, setTheme] = useState<Themes['dark' | 'light']>(_themes.light);
  const [hallOpen, setHallOpen] = useState<boolean>(false);

  const openMenu = () => {
    setHallOpen(!hallOpen);
  };

  useEffect(() => {
    setTheme(_themes[currentTheme]);
  }, [currentTheme]);

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
      <Room {...room} />
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
      <Hall open={hallOpen} />
    </ThemeContext.Provider>
  );
}

export default Main;
