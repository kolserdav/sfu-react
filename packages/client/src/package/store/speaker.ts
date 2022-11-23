/******************************************************************************************
 * Repository: https://github.com/kolserdav/werift-sfu-react.git
 * File name: speaker.ts
 * Author: Sergey Kolmiller
 * Email: <uyem.ru@gmail.com>
 * License: MIT
 * License text: See in LICENSE file
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Wed Nov 23 2022 15:23:26 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/
import { createSlice, configureStore } from '@reduxjs/toolkit';

interface State {
  speaker: string | number;
}

interface Action {
  payload: State;
}

const slice = createSlice({
  name: 'speaker',
  initialState: {
    speaker: 0,
  } as State,
  reducers: {
    changeSpeaker: (state: State, action: Action) => {
      // eslint-disable-next-line no-param-reassign
      state.speaker = action.payload.speaker;
    },
  },
});

export const { changeSpeaker } = slice.actions;

const storeSpeaker = configureStore({
  reducer: slice.reducer,
});

export default storeSpeaker;
