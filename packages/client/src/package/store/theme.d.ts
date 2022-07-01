import { ThemeType } from '../types';
interface State {
    theme: ThemeType;
}
export declare const changeTheme: import("@reduxjs/toolkit").ActionCreatorWithPayload<State, string>;
declare const storeTheme: import("@reduxjs/toolkit").EnhancedStore<State, import("redux").AnyAction, [import("redux-thunk").ThunkMiddleware<State, import("redux").AnyAction, undefined>]>;
export default storeTheme;
