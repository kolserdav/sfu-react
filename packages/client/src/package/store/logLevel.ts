/******************************************************************************************
 * Repository: https://github.com/kolserdav/werift-sfu-react.git
 * File name: logLevel.ts
 * Author: Sergey Kolmiller
 * Email: <kolserdav@uyem.ru>
 * License: MIT
 * License text: See in LICENSE file
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Wed Aug 02 2023 23:56:49 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/
import { createSlice, configureStore } from '@reduxjs/toolkit';
import { LogLevel } from '../types/interfaces';
import { LOG_LEVEL } from '../utils/constants';

interface State {
  logLevel: LogLevel;
}

interface Action {
  payload: State;
}

const slice = createSlice({
  name: 'logLevel',
  initialState: {
    logLevel: LOG_LEVEL,
  } as State,
  reducers: {
    changeLogLevel: (state: State, action: Action) => {
      // eslint-disable-next-line no-param-reassign
      state.logLevel = action.payload.logLevel;
    },
  },
});

export const { changeLogLevel } = slice.actions;

const storeLogLevel = configureStore({
  reducer: slice.reducer,
});

export default storeLogLevel;
