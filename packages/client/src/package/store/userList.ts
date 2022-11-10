/******************************************************************************************
 * Repository: https://github.com/kolserdav/werift-sfu-react.git
 * File name: userList.ts
 * Author: Sergey Kolmiller
 * Email: <uyem.ru@gmail.com>
 * License: MIT
 * License text: See in LICENSE file
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Wed Aug 24 2022 14:14:09 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/
import { createSlice, configureStore } from '@reduxjs/toolkit';
import { RoomList, Banneds } from '../types/interfaces';

interface State {
  userList: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    muteds: RoomList[any];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    adminMuteds: RoomList[any];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    banneds: Banneds[any];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    askeds: RoomList[any];
  };
}

interface Action {
  payload: State;
}

const slice = createSlice({
  name: 'userList',
  initialState: {
    userList: {
      muteds: [],
      adminMuteds: [],
      banneds: [],
      askeds: [],
    },
  } as State,
  reducers: {
    changeUserList: (state: State, action: Action) => {
      // eslint-disable-next-line no-param-reassign
      state.userList = action.payload.userList;
    },
  },
});

export const { changeUserList } = slice.actions;

const storeUserList = configureStore({
  reducer: slice.reducer,
});

export default storeUserList;
