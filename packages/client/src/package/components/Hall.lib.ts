/******************************************************************************************
 * Repository: https://github.com/kolserdav/werift-sfu-react.git
 * File name: Hall.lib.ts
 * Author: Sergey Kolmiller
 * Email: <kolserdav@uyem.ru>
 * License: MIT
 * License text: See in LICENSE file
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Wed Aug 02 2023 23:56:49 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/
import storeTheme, { changeTheme } from '../store/theme';
import { setLocalStorage, LocalStorageName } from '../utils/localStorage';

// eslint-disable-next-line import/prefer-default-export
export const changeThemeHandler = () => {
  const { theme } = storeTheme.getState();
  storeTheme.dispatch(changeTheme({ theme }));
  setLocalStorage(LocalStorageName.THEME, theme === 'dark' ? 'light' : 'dark');
};
