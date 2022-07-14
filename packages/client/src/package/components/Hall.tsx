/******************************************************************************************
 * Repository: https://github.com/kolserdav/react-node-webrtc-sfu.git
 * File name: Hall.tsx
 * Author: Sergey Kolmiller
 * Email: <uyem.ru@gmail.com>
 * License: MIT
 * License text: 
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Thu Jul 14 2022 16:24:49 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/
import React, { useContext } from 'react';
import clsx from 'clsx';
import ThemeContext from '../Theme.context';
import ThemeIcon from '../Icons/ThemeIcon';
import storeTheme, { changeTheme } from '../store/theme';

import s from './Hall.module.scss';
import IconButton from './ui/IconButton';

const changeThemeHandler = () => {
  const { theme } = storeTheme.getState();
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
