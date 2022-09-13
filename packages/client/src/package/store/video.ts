/******************************************************************************************
 * Repository: https://github.com/kolserdav/werift-sfu-react.git
 * File name: streams.ts
 * Author: Sergey Kolmiller
 * Email: <uyem.ru@gmail.com>
 * License: MIT
 * License text: See in LICENSE file
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Wed Aug 24 2022 14:14:09 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/
import { createSlice, configureStore } from '@reduxjs/toolkit';
import { VideoFull } from '../types';

interface State {
  videos: VideoFull[];
  count: number;
  take: number;
  skip: number;
}

interface Action {
  payload: State;
}
const slice = createSlice({
  name: 'videos',
  initialState: {
    videos: [],
    count: 0,
    take: 0,
    skip: 0,
  } as State,
  reducers: {
    changeVideos: (state: State, action: Action) => {
      // eslint-disable-next-line no-param-reassign
      state.videos = action.payload.videos;
    },
  },
});

export const { changeVideos } = slice.actions;

const storeVideos = configureStore({
  reducer: slice.reducer,
});

export default storeVideos;
