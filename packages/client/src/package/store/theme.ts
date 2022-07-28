/******************************************************************************************
 * Repository: https://github.com/kolserdav/webrtc-sfu-node-react.git
 * File name: theme.ts
 * Author: Sergey Kolmiller
 * Email: <uyem.ru@gmail.com>
 * License: MIT
 * License text: Show LICENSE file
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Thu Jul 28 2022 22:09:23 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/
import { createSlice, configureStore } from '@reduxjs/toolkit';
import { ThemeType } from '../types';

interface State {
  theme: ThemeType;
}

interface Action {
  payload: State;
}

const slice = createSlice({
  name: 'theme',
  initialState: {
    theme: 'light',
  } as State,
  reducers: {
    changeTheme: (state: State, action: Action) => {
      // eslint-disable-next-line no-param-reassign
      state.theme = action.payload.theme === 'dark' ? 'light' : 'dark';
    },
  },
});

/**
 * FIXME change @reduxjs/toolkit to IndexedDB
 * @deprecated
 */
export const { changeTheme } = slice.actions;

/**
 * FIXME change @reduxjs/toolkit to IndexedDB
 * @deprecated
 */
const storeTheme = configureStore({
  reducer: slice.reducer,
});

export default storeTheme;
