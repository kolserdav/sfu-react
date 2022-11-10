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
