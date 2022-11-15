import { createSlice, configureStore } from '@reduxjs/toolkit';

type State = {
  chatBlockeds: (string | number)[];
};

interface Action {
  payload: State;
}

const slice = createSlice({
  name: 'chatBlockeds',
  initialState: {
    chatBlockeds: [],
  } as State,
  reducers: {
    changeChatBlockeds: (state: State, action: Action) => {
      // eslint-disable-next-line no-param-reassign
      state.chatBlockeds = action.payload.chatBlockeds;
    },
  },
});

export const { changeChatBlockeds } = slice.actions;

const storeChatBlockeds = configureStore({
  reducer: slice.reducer,
});

export default storeChatBlockeds;
