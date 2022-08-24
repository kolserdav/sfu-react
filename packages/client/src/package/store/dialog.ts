/******************************************************************************************
 * Repository: https://github.com/kolserdav/werift-sfu-react.git
 * File name: dialog.ts
 * Author: Sergey Kolmiller
 * Email: <uyem.ru@gmail.com>
 * License: MIT
 * License text: See in LICENSE file
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Fri Jul 29 2022 21:35:51 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/
import { createSlice, configureStore } from '@reduxjs/toolkit';
import { DialogProps } from '../types';
import { DIALOG_DEFAULT } from '../utils/constants';

interface State {
  dialog: DialogProps;
}

interface Action {
  payload: State;
}

const slice = createSlice({
  name: 'dialog',
  initialState: {
    dialog: DIALOG_DEFAULT,
  } as State,
  reducers: {
    changeDialog: (state: State, action: Action) => {
      // eslint-disable-next-line no-param-reassign
      state.dialog = action.payload.dialog;
    },
  },
});

/**
 * FIXME change @reduxjs/toolkit to IndexedDB
 * @deprecated
 */
export const { changeDialog } = slice.actions;

/**
 * FIXME change @reduxjs/toolkit to IndexedDB
 * @deprecated
 */
const storeDialog = configureStore({
  reducer: slice.reducer,
});

export default storeDialog;
