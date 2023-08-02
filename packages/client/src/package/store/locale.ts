/******************************************************************************************
 * Repository: https://github.com/kolserdav/werift-sfu-react.git
 * File name: locale.ts
 * Author: Sergey Kolmiller
 * Email: <kolserdav@uyem.ru>
 * License: MIT
 * License text: See in LICENSE file
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Wed Aug 02 2023 23:56:49 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/
import { createSlice, configureStore } from '@reduxjs/toolkit';
import { LocaleValue, LocaleDefault } from '../types/interfaces';
import { getCookie, CookieName, setCookie } from '../utils/cookies';

interface State {
  locale: LocaleValue;
}

interface Action {
  payload: State;
}

const locale = getCookie(CookieName.lang) || LocaleDefault;
if (locale === LocaleDefault) {
  setCookie(CookieName.lang, locale);
}

const slice = createSlice({
  name: 'locale',
  initialState: {
    locale,
  } as State,
  reducers: {
    changeLocale: (state: State, action: Action) => {
      // eslint-disable-next-line no-param-reassign
      state.locale = action.payload.locale;
    },
  },
});

export const { changeLocale } = slice.actions;

const storeLocale = configureStore({
  reducer: slice.reducer,
});

export default storeLocale;
