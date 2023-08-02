/******************************************************************************************
 * Repository: https://github.com/kolserdav/werift-sfu-react.git
 * File name: speaker.ts
 * Author: Sergey Kolmiller
 * Email: <kolserdav@uyem.ru>
 * License: MIT
 * License text: See in LICENSE file
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Wed Aug 02 2023 23:56:49 GMT+0700 (Krasnoyarsk Standard Time)
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
