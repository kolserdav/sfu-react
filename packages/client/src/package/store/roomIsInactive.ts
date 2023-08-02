/******************************************************************************************
 * Repository: https://github.com/kolserdav/werift-sfu-react.git
 * File name: roomIsInactive.ts
 * Author: Sergey Kolmiller
 * Email: <kolserdav@uyem.ru>
 * License: MIT
 * License text: See in LICENSE file
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Wed Aug 02 2023 23:56:49 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/
import { createSlice, configureStore } from '@reduxjs/toolkit';

interface State {
  roomIsInactive: boolean;
}

interface Action {
  payload: State;
}

const slice = createSlice({
  name: 'logLevel',
  initialState: {
    roomIsInactive: false,
  } as State,
  reducers: {
    changeRoomIsInactive: (state: State, action: Action) => {
      // eslint-disable-next-line no-param-reassign
      state.roomIsInactive = action.payload.roomIsInactive;
    },
  },
});

export const { changeRoomIsInactive } = slice.actions;

const storeRoomIsInactive = configureStore({
  reducer: slice.reducer,
});

export default storeRoomIsInactive;
