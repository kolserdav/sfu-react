/******************************************************************************************
 * Repository: https://github.com/kolserdav/uyem.git
 * File name: theme.ts
 * Author: Sergey Kolmiller
 * Email: <uyem.ru@gmail.com>
 * License: BSD-2-Clause
 * License text: Binary distributions of this software include 'wrtc' and other third-party libraries.
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Tue Jun 21 2022 08:49:55 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/
import { createSlice, configureStore } from '@reduxjs/toolkit';
import { Stream } from '../types';

interface State {
  streams: Stream[];
}

interface Action {
  payload: {
    type: 'add' | 'delete';
    stream: Stream;
  };
}

const slice = createSlice({
  name: 'streams',
  initialState: {
    streams: [],
  },
  reducers: {
    changeStreams: (state: State, action: Action) => {
      const oldStreams = state.streams;
      let streams: Stream[] = [];
      const {
        payload: { stream, type },
      } = action;
      switch (type) {
        case 'add':
          if (!oldStreams.find((item) => item.target === stream.target)) {
            oldStreams.push(stream);
            streams = oldStreams;
          }
          break;
        case 'delete':
          streams = oldStreams.filter((item) => item.target !== stream.target);
          break;
      }
      // eslint-disable-next-line no-param-reassign
      state.streams = streams;
    },
  },
});

export const { changeStreams } = slice.actions;

const storeStreams = configureStore({
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck: false }),
  reducer: slice.reducer,
});

export default storeStreams;
