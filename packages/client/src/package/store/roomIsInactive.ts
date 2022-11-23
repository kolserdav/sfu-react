/******************************************************************************************
 * Repository: https://github.com/kolserdav/werift-sfu-react.git
 * File name: roomIsInactive.ts
 * Author: Sergey Kolmiller
 * Email: <uyem.ru@gmail.com>
 * License: MIT
 * License text: See in LICENSE file
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Wed Nov 23 2022 15:23:26 GMT+0700 (Krasnoyarsk Standard Time)
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
