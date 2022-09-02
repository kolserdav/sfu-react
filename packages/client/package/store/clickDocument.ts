import { createSlice, configureStore } from '@reduxjs/toolkit';
import { ClickPosition } from '../types';
import { CLICK_POSITION_DEFAULT } from '../utils/constants';

interface State {
  clickDocument: ClickPosition;
}

interface Action {
  payload: State;
}

const slice = createSlice({
  name: 'clickDocument',
  initialState: {
    clickDocument: CLICK_POSITION_DEFAULT,
  } as State,
  reducers: {
    changeClickDocument: (state: State, action: Action) => {
      // eslint-disable-next-line no-param-reassign
      state.clickDocument = action.payload.clickDocument;
    },
  },
});

export const { changeClickDocument } = slice.actions;

const storeClickDocument = configureStore({
  reducer: slice.reducer,
});

export default storeClickDocument;
