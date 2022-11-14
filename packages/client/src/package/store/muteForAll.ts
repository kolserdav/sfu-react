import { createSlice, configureStore } from '@reduxjs/toolkit';
import { MessageType } from '../types/interfaces';

interface State {
  type: MessageType.GET_MUTE_FOR_ALL | MessageType.SET_MUTE_FOR_ALL;
  muteForAll: boolean;
}

interface Action {
  payload: State;
}

const slice = createSlice({
  name: 'muteForAll',
  initialState: {
    type: MessageType.GET_MUTE_FOR_ALL,
    muteForAll: false,
  } as State,
  reducers: {
    changeMuteForAll: (state: State, action: Action) => {
      // eslint-disable-next-line no-param-reassign
      state.type = action.payload.type;
      // eslint-disable-next-line no-param-reassign
      state.muteForAll = action.payload.muteForAll;
    },
  },
});

export const { changeMuteForAll } = slice.actions;

const storeMuteForAll = configureStore({
  reducer: slice.reducer,
});

export default storeMuteForAll;
