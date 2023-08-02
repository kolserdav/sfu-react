/******************************************************************************************
 * Repository: https://github.com/kolserdav/werift-sfu-react.git
 * File name: error.ts
 * Author: Sergey Kolmiller
 * Email: <kolserdav@uyem.ru>
 * License: MIT
 * License text: See in LICENSE file
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Wed Aug 02 2023 23:56:49 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/
import { createSlice, configureStore } from '@reduxjs/toolkit';
import { ErrorCode } from '../types/interfaces';

interface State {
  error: keyof typeof ErrorCode;
}

interface Action {
  payload: State;
}

const slice = createSlice({
  name: 'dialog',
  initialState: {
    error: ErrorCode.initial,
  } as State,
  reducers: {
    changeError: (state: State, action: Action) => {
      // eslint-disable-next-line no-param-reassign
      state.error = action.payload.error;
    },
  },
});

export const { changeError } = slice.actions;

const storeError = configureStore({
  reducer: slice.reducer,
});

export default storeError;
