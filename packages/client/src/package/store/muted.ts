/******************************************************************************************
 * Repository: https://github.com/kolserdav/werift-sfu-react.git
 * File name: muted.ts
 * Author: Sergey Kolmiller
 * Email: <kolserdav@uyem.ru>
 * License: MIT
 * License text: See in LICENSE file
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Wed Aug 02 2023 23:56:49 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/
import { createSlice, configureStore } from '@reduxjs/toolkit';

interface State {
  id: string | number;
  muted: boolean;
}

interface Action {
  payload: State;
}

const slice = createSlice({
  name: 'muted',
  initialState: {
    id: 0,
    muted: true,
  } as State,
  reducers: {
    changeMuted: (state: State, action: Action) => {
      // eslint-disable-next-line no-param-reassign
      state.id = action.payload.id;
      // eslint-disable-next-line no-param-reassign
      state.muted = action.payload.muted;
    },
  },
});

export const { changeMuted } = slice.actions;

const storeMuted = configureStore({
  reducer: slice.reducer,
});

export default storeMuted;
