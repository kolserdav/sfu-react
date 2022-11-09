import { createSlice, configureStore } from '@reduxjs/toolkit';

interface State {
  id: string | number;
  adminMuted: boolean;
}

interface Action {
  payload: State;
}

const slice = createSlice({
  name: 'adminMuted',
  initialState: {
    id: 0,
    adminMuted: true,
  } as State,
  reducers: {
    changeAdminMuted: (state: State, action: Action) => {
      // eslint-disable-next-line no-param-reassign
      state.id = action.payload.id;
      // eslint-disable-next-line no-param-reassign
      state.adminMuted = action.payload.adminMuted;
    },
  },
});

export const { changeAdminMuted } = slice.actions;

const storeAdminMuted = configureStore({
  reducer: slice.reducer,
});

export default storeAdminMuted;
