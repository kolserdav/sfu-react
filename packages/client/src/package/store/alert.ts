/******************************************************************************************
 * Repository: https://github.com/kolserdav/werift-sfu-react.git
 * File name: alert.ts
 * Author: Sergey Kolmiller
 * Email: <uyem.ru@gmail.com>
 * License: MIT
 * License text: See in LICENSE file
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Wed Aug 24 2022 14:14:09 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/
import { createSlice, configureStore } from '@reduxjs/toolkit';
import { AlertProps } from '../types';
import { ALERT_DEFAULT } from '../utils/constants';

interface State {
  alert: AlertProps;
}

interface Action {
  payload: State;
}

const slice = createSlice({
  name: 'alert',
  initialState: {
    alert: ALERT_DEFAULT,
  } as State,
  reducers: {
    changeAlert: (state: State, action: Action) => {
      // eslint-disable-next-line no-param-reassign
      state.alert = action.payload.alert;
    },
  },
});

export const { changeAlert } = slice.actions;

const storeAlert = configureStore({
  reducer: slice.reducer,
});

export default storeAlert;
