/******************************************************************************************
 * Repository: https://github.com/kolserdav/werift-sfu-react.git
 * File name: volume.ts
 * Author: Sergey Kolmiller
 * Email: <uyem.ru@gmail.com>
 * License: MIT
 * License text: See in LICENSE file
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Fri Dec 09 2022 05:47:21 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/
import { createSlice, configureStore } from '@reduxjs/toolkit';

interface State {
  id: string | number;
  volume: number;
}

interface Action {
  payload: State;
}

const slice = createSlice({
  name: 'volume',
  initialState: {
    id: 0,
    volume: 1,
  } as State,
  reducers: {
    changeVolume: (state: State, action: Action) => {
      // eslint-disable-next-line no-param-reassign
      state.id = action.payload.id;
      // eslint-disable-next-line no-param-reassign
      state.volume = action.payload.volume;
    },
  },
});

export const { changeVolume } = slice.actions;

const storeVolume = configureStore({
  reducer: slice.reducer,
});

export default storeVolume;
