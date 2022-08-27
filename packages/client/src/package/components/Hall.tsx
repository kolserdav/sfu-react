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
import React, { useContext, useEffect, useState } from 'react';
import clsx from 'clsx';
import { HallProps } from '../types';
import ThemeContext from '../Theme.context';
import ThemeIcon from '../Icons/ThemeIcon';
import Chat from './Chat';
import storeTheme, { changeTheme } from '../store/theme';
import { LocaleDefault, LocaleSelector, LocaleValue } from '../types/interfaces';
import storeLocale, { changeLocale } from '../store/locale';
import Select from './ui/Select';
import { setLocalStorage, LocalStorageName } from '../utils/localStorage';
import { getCookie, CookieName, setCookie } from '../utils/cookies';
import CloseIcon from '../Icons/Close';
import s from './Hall.module.scss';
import IconButton from './ui/IconButton';
import SettingsIcon from '../Icons/SettingsIcon';
import storeStreams from '../store/streams';

const changeThemeHandler = () => {
  const { theme } = storeTheme.getState();
  storeTheme.dispatch(changeTheme({ theme }));
  setLocalStorage(LocalStorageName.THEME, theme === 'dark' ? 'light' : 'dark');
};

function Hall({ open, locale, server, port, roomId, userId }: HallProps) {
  const [lang, setLang] = useState<LocaleValue>(getCookie(CookieName.lang) || LocaleDefault);
  const theme = useContext(ThemeContext);
  const [openSettings, setOpenSettings] = useState<boolean>(false);

  const changeLang = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as LocaleValue;
    setLang(value);
    setCookie(CookieName.lang, value);
    storeLocale.dispatch(changeLocale({ locale: value }));
  };

  const openSettingsDialog = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    setOpenSettings(!openSettings);
  };

  useEffect(() => {
    const cleanSubs = storeStreams.subscribe(() => {
      const state = storeStreams.getState();
      console.log(state);
    });
    return () => {
      cleanSubs();
    };
  }, []);

  return (
    <div className={clsx(s.wrapper, open ? s.open : '')}>
      <div className={s.container} style={theme.container}>
        <div className={s.block}>
          <div className={s.users}>Users</div>
          <Chat locale={locale} userId={userId} roomId={roomId} server={server} port={port} />
          <div
            style={{ background: theme.colors.active }}
            className={clsx(s.settings, openSettings ? s.open : '')}
          >
            <Select onChange={changeLang} value={lang}>
              {LocaleSelector}
            </Select>
            <IconButton onClick={changeThemeHandler} title={locale.changeTheme}>
              <ThemeIcon color={theme.colors.text} />
            </IconButton>
          </div>
          {open && (
            <IconButton onClick={openSettingsDialog} className={s.settings__button}>
              {openSettings ? (
                <CloseIcon color={theme.colors.text} />
              ) : (
                <SettingsIcon color={theme.colors.text} />
              )}
            </IconButton>
          )}
        </div>
      </div>
    </div>
  );
}

export default Hall;
