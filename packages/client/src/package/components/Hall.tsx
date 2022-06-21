/******************************************************************************************
 * Repository: https://github.com/kolserdav/uyem.git
 * File name: Hall.tsx
 * Author: Sergey Kolmiller
 * Email: <uyem.ru@gmail.com>
 * License: BSD-2-Clause
 * License text: Binary distributions of this software include WebRTC and other third-party libraries.
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Tue Jun 21 2022 07:43:56 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/
import React, { useContext } from 'react';
import clsx from 'clsx';
import { ThemeContext } from '../Main.context';
import ThemeIcon from '../Icons/ThemeIcon';
import storeTheme, { changeTheme } from '../store/theme';

import s from './Hall.module.scss';
import IconButton from './ui/IconButton';

const changeThemeHandler = () => {
  const { theme } = storeTheme.getState();
  console.log(theme);
  storeTheme.dispatch(changeTheme({ theme }));
};

function Hall({ open }: { open: boolean }) {
  const theme = useContext(ThemeContext);
  return (
    <div className={clsx(s.wrapper, open ? s.open : '')}>
      <div className={s.container} style={theme.container}>
        <div className={s.block}>
          Hall
          <IconButton onClick={changeThemeHandler}>
            <ThemeIcon color={theme.colors.text} />
          </IconButton>
        </div>
      </div>
    </div>
  );
}

export default Hall;
