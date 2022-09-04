/******************************************************************************************
 * Repository: https://github.com/kolserdav/werift-sfu-react.git
 * File name: message.ts
 * Author: Sergey Kolmiller
 * Email: <uyem.ru@gmail.com>
 * License: MIT
 * License text: See in LICENSE file
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Wed Aug 24 2022 14:14:09 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/
import { createSlice, configureStore } from '@reduxjs/toolkit';
import { SendMessageArgs } from '../types/interfaces';

interface State {
  message: {
    type: 'room';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: SendMessageArgs<any>;
  };
}

interface Action {
  payload: State;
}

const slice = createSlice({
  name: 'message',
  initialState: {
    message: {},
  } as State,
  reducers: {
    changeMessage: (state: State, action: Action) => {
      // eslint-disable-next-line no-param-reassign
      state.message = action.payload.message;
    },
  },
});

export const { changeMessage } = slice.actions;

const storeMessage = configureStore({
  reducer: slice.reducer,
});

export default storeMessage;
