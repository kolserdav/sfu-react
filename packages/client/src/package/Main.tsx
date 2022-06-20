/* eslint-disable jsx-a11y/click-events-have-key-events */
/******************************************************************************************
 * Repository: https://github.com/kolserdav/uyem.git
 * File name: Main.tsx
 * Author: Sergey Kolmiller
 * Email: <uyem.ru@gmail.com>
 * License: BSD-2-Clause
 * License text: Binary distributions of this software include WebRTC and other third-party libraries.
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Sun Jun 19 2022 01:44:53 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/
import React, { useEffect, useState } from 'react';
import clsx from 'clsx';
import Room from './components/Room';
import { RoomProps } from './types';
import { ThemeContext, themes, Themes } from './Main.context';
import ChevronLeftIcon from './Icons/ChevronLeft';
import s from './Main.module.scss';

// TODO theme provider
function Main({ id }: RoomProps) {
  const [currentTheme, setCurrentTheme] = useState<keyof Themes>('light');
  const [theme, setTheme] = useState<Themes['dark' | 'light']>(themes.light);

  const changeTheme = () => {
    setCurrentTheme(currentTheme === 'dark' ? 'light' : 'dark');
  };

  const openMenu = () => {
    /** */
  };

  useEffect(() => {
    setTheme(themes[currentTheme]);
  }, [currentTheme]);

  return (
    <ThemeContext.Provider value={theme}>
      <Room id={id} />
      <div className={clsx(theme.button, s.button)} role="button" tabIndex={0} onClick={openMenu}>
        <ChevronLeftIcon className={s.button__icon} color={theme.colors.shadow} />
      </div>
    </ThemeContext.Provider>
  );
}

export default Main;
