import { createSlice, configureStore } from '@reduxjs/toolkit';

interface State {
  windowResize: number;
}

interface Action {
  payload: State;
}

const slice = createSlice({
  name: 'windowResize',
  initialState: {
    windowResize: 0,
  } as State,
  reducers: {
    changeWindowResize: (state: State, action: Action) => {
      // eslint-disable-next-line no-param-reassign
      state.windowResize = action.payload.windowResize;
    },
  },
});

export const { changeWindowResize } = slice.actions;

const storeWindowResize = configureStore({
  reducer: slice.reducer,
});

export default storeWindowResize;
