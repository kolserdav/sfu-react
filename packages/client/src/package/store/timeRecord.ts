/******************************************************************************************
 * Repository: https://github.com/kolserdav/werift-sfu-react.git
 * File name: timeRecord.ts
 * Author: Sergey Kolmiller
 * Email: <uyem.ru@gmail.com>
 * License: MIT
 * License text: See in LICENSE file
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Wed Aug 24 2022 14:14:09 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/
import { createSlice, configureStore } from '@reduxjs/toolkit';
import { MessageType, SendMessageArgs, ArgsSubset } from '../types/interfaces';

interface Action<T extends keyof typeof MessageType> {
  message: {
    type: 'recording';
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
  name: 'timeRecord',
  initialState: {
    message: {},
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any,
  reducers: {
    changeTimeRecord: (state, action) => {
      // eslint-disable-next-line no-param-reassign
      state.message = action.payload.message;
    },
  },
});

export const { changeTimeRecord } = slice.actions as {
  changeTimeRecord: ChangeMessage;
};

const storeTimeRecord = configureStore({
  reducer: slice.reducer,
});

export type RootState<T extends keyof typeof MessageType> = Action<T>;

export default storeTimeRecord;
