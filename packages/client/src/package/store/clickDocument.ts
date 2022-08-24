import { createSlice, configureStore } from '@reduxjs/toolkit';
import { ClickPosition } from '../types';

interface State {
  clickDocument: ClickPosition;
}

interface Action {
  payload: State;
}

const slice = createSlice({
  name: 'clickDocument',
  initialState: {
    clickDocument: {
      clientX: 0,
      clientY: 0,
    },
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
