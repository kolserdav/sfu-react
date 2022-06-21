/******************************************************************************************
 * Repository: https://github.com/kolserdav/uyem.git
 * File name: theme.ts
 * Author: Sergey Kolmiller
 * Email: <uyem.ru@gmail.com>
 * License: BSD-2-Clause
 * License text: Binary distributions of this software include WebRTC and other third-party libraries.
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Tue Jun 21 2022 07:43:56 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/
import { createSlice, configureStore } from '@reduxjs/toolkit';
import { ThemeType } from '../types';

interface ThemeState {
  theme: ThemeType;
}

interface ThemeAction {
  payload: ThemeState;
}

const themeSlice = createSlice({
  name: 'theme',
  initialState: {
    theme: 'light',
  } as ThemeState,
  reducers: {
    changeTheme: (state: ThemeState, action: ThemeAction) => {
      // eslint-disable-next-line no-param-reassign
      state.theme = action.payload.theme === 'dark' ? 'light' : 'dark';
    },
  },
});

export const { changeTheme } = themeSlice.actions;

const storeTheme = configureStore({
  reducer: themeSlice.reducer,
});

export default storeTheme;
