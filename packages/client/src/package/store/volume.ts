import { createSlice, configureStore } from '@reduxjs/toolkit';

interface State {
  id: string | number;
  volume: number;
}

interface Action {
  payload: State;
}

const slice = createSlice({
  name: 'volume',
  initialState: {
    id: 0,
    volume: 1,
  } as State,
  reducers: {
    changeVolume: (state: State, action: Action) => {
      // eslint-disable-next-line no-param-reassign
      state.id = action.payload.id;
      // eslint-disable-next-line no-param-reassign
      state.volume = action.payload.volume;
    },
  },
});

export const { changeVolume } = slice.actions;

const storeVolume = configureStore({
  reducer: slice.reducer,
});

export default storeVolume;
