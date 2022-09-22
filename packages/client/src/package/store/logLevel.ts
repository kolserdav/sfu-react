/******************************************************************************************
 * Repository: https://github.com/kolserdav/werift-sfu-react.git
 * File name: logLevel.ts
 * Author: Sergey Kolmiller
 * Email: <uyem.ru@gmail.com>
 * License: MIT
 * License text: See in LICENSE file
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Wed Aug 24 2022 14:14:09 GMT+0700 (Krasnoyarsk Standard Time)
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
