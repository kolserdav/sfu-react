/******************************************************************************************
 * Repository: https://github.com/kolserdav/werift-sfu-react.git
 * File name: asked.ts
 * Author: Sergey Kolmiller
 * Email: <kolserdav@uyem.ru>
 * License: MIT
 * License text: See in LICENSE file
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Wed Aug 02 2023 23:56:49 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/
import { createSlice, configureStore } from '@reduxjs/toolkit';
import { MessageType, SendMessageArgs } from '../types/interfaces';

type State = SendMessageArgs<MessageType.GET_ASK_FLOOR>['data'];

interface Action {
  payload: State;
}

const slice = createSlice({
  name: 'asked',
  initialState: {
    command: 'add',
    userId: 0,
  } as State,
  reducers: {
    changeAsked: (state: State, action: Action) => {
      // eslint-disable-next-line no-param-reassign
      state.command = action.payload.command;
      // eslint-disable-next-line no-param-reassign
      state.userId = action.payload.userId;
    },
  },
});

export const { changeAsked } = slice.actions;

const storeAsked = configureStore({
  reducer: slice.reducer,
});

export default storeAsked;
