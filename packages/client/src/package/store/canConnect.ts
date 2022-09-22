/******************************************************************************************
 * Repository: https://github.com/kolserdav/werift-sfu-react.git
 * File name: canConnect.ts
 * Author: Sergey Kolmiller
 * Email: <uyem.ru@gmail.com>
 * License: MIT
 * License text: See in LICENSE file
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Wed Aug 24 2022 14:14:09 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/
import { createSlice, configureStore } from '@reduxjs/toolkit';

interface State {
  canConnect: boolean;
}

interface Action {
  payload: State;
}

const slice = createSlice({
  name: 'dialog',
  initialState: {
    canConnect: false,
  } as State,
  reducers: {
    changeCanConnect: (state: State, action: Action) => {
      // eslint-disable-next-line no-param-reassign
      state.canConnect = action.payload.canConnect;
    },
  },
});

export const { changeCanConnect } = slice.actions;

const storeCanConnect = configureStore({
  reducer: slice.reducer,
});

export default storeCanConnect;
