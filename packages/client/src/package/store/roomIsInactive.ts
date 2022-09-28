import { createSlice, configureStore } from '@reduxjs/toolkit';

interface State {
  roomIsInactive: boolean;
}

interface Action {
  payload: State;
}

const slice = createSlice({
  name: 'logLevel',
  initialState: {
    roomIsInactive: false,
  } as State,
  reducers: {
    changeRoomIsInactive: (state: State, action: Action) => {
      // eslint-disable-next-line no-param-reassign
      state.roomIsInactive = action.payload.roomIsInactive;
    },
  },
});

export const { changeRoomIsInactive } = slice.actions;

const storeRoomIsInactive = configureStore({
  reducer: slice.reducer,
});

export default storeRoomIsInactive;
