/******************************************************************************************
 * Repository: https://github.com/kolserdav/werift-sfu-react.git
 * File name: message.ts
 * Author: Sergey Kolmiller
 * Email: <kolserdav@uyem.ru>
 * License: MIT
 * License text: See in LICENSE file
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Wed Aug 02 2023 23:56:49 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/
import { createSlice, configureStore } from '@reduxjs/toolkit';
import { MessageType, SendMessageArgs, ArgsSubset } from '../types/interfaces';

interface Action<T extends keyof typeof MessageType> {
  message: {
    type: 'room' | 'chat';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: Omit<SendMessageArgs<any>, 'data' | 'type'> & {
      type: T;
      data: ArgsSubset<T>;
    };
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ChangeMessage = <T extends keyof typeof MessageType>(action: Action<T>) => any;

const slice = createSlice({
  name: 'message',
  initialState: {
    message: {},
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any,
  reducers: {
    changeMessage: (state, action) => {
      // eslint-disable-next-line no-param-reassign
      state.message = action.payload.message;
    },
  },
});

export const { changeMessage } = slice.actions as {
  changeMessage: ChangeMessage;
};

const storeMessage = configureStore({
  reducer: slice.reducer,
});

export default storeMessage;
