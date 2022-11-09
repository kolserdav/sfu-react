import { createSlice, configureStore } from '@reduxjs/toolkit';

interface State {
  muted: boolean;
}

interface Action {
  payload: State;
}

const slice = createSlice({
  name: 'muted',
  initialState: {
    muted: true,
  } as State,
  reducers: {
    changeMuted: (state: State, action: Action) => {
      // eslint-disable-next-line no-param-reassign
      state.muted = action.payload.muted;
    },
  },
});

export const { changeMuted } = slice.actions;

const storeMuted = configureStore({
  reducer: slice.reducer,
});

export default storeMuted;
