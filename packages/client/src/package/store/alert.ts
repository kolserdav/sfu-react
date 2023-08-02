/******************************************************************************************
 * Repository: https://github.com/kolserdav/werift-sfu-react.git
 * File name: alert.ts
 * Author: Sergey Kolmiller
 * Email: <kolserdav@uyem.ru>
 * License: MIT
 * License text: See in LICENSE file
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Wed Aug 02 2023 23:56:49 GMT+0700 (Krasnoyarsk Standard Time)
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
