/******************************************************************************************
 * Repository: https://github.com/kolserdav/werift-sfu-react.git
 * File name: Hall.tsx
 * Author: Sergey Kolmiller
 * Email: <uyem.ru@gmail.com>
 * License: MIT
 * License text: See in LICENSE file
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Fri Jul 29 2022 21:35:51 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/
import React, { useContext, useState } from 'react';
import clsx from 'clsx';
import { HallProps } from '../types';
import ThemeContext from '../Theme.context';
import ThemeIcon from '../Icons/ThemeIcon';
import storeTheme, { changeTheme } from '../store/theme';
import { LocaleDefault, LocaleSelector, LocaleValue } from '../types/interfaces';
import storeLocale, { changeLocale } from '../store/locale';
import Select from './ui/Select';
import { setLocalStorage, LocalStorageName } from '../utils/localStorage';
import { getCookie, CookieName, setCookie } from '../utils/cookies';

import s from './Hall.module.scss';
import IconButton from './ui/IconButton';

const changeThemeHandler = () => {
  const { theme } = storeTheme.getState();
  storeTheme.dispatch(changeTheme({ theme }));
  setLocalStorage(LocalStorageName.THEME, theme === 'dark' ? 'light' : 'dark');
};

function Hall({ open, locale }: HallProps) {
  const [lang, setLang] = useState<LocaleValue>(getCookie(CookieName.lang) || LocaleDefault);
  const theme = useContext(ThemeContext);
  const changeLang = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as LocaleValue;
    setLang(value);
    setCookie(CookieName.lang, value);
    storeLocale.dispatch(changeLocale({ locale: value }));
  };

  return (
    <div className={clsx(s.wrapper, open ? s.open : '')}>
      <div className={s.container} style={theme.container}>
        <div className={s.block}>
          <div className={s.users}>Users</div>
          <div className={s.chat}>Chat</div>
          <div className={s.settings}>
            <Select onChange={changeLang} value={lang}>
              {LocaleSelector}
            </Select>
            <IconButton onClick={changeThemeHandler} title={locale.changeTheme}>
              <ThemeIcon color={theme.colors.text} />
            </IconButton>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Hall;
