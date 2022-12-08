/******************************************************************************************
 * Repository: https://github.com/kolserdav/werift-sfu-react.git
 * File name: banned.ts
 * Author: Sergey Kolmiller
 * Email: <uyem.ru@gmail.com>
 * License: MIT
 * License text: See in LICENSE file
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Fri Dec 09 2022 05:47:21 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/
import { createSlice, configureStore } from '@reduxjs/toolkit';

interface State {
  id: string | number;
  banned: boolean;
}

interface Action {
  payload: State;
}

const slice = createSlice({
  name: 'banned',
  initialState: {
    id: 0,
    banned: true,
  } as State,
  reducers: {
    changeBanned: (state: State, action: Action) => {
      // eslint-disable-next-line no-param-reassign
      state.id = action.payload.id;
      // eslint-disable-next-line no-param-reassign
      state.banned = action.payload.banned;
    },
  },
});

export const { changeBanned } = slice.actions;

const storeBanned = configureStore({
  reducer: slice.reducer,
});

export default storeBanned;
