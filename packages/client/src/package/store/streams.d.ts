import { Stream } from '../types';
interface State {
    streams: Stream[];
}
interface Action {
    type: 'add' | 'delete' | 'clean';
    stream: Stream;
    change?: boolean;
}
export declare const changeStreams: import("@reduxjs/toolkit").ActionCreatorWithPayload<Action, string>;
declare const storeStreams: import("@reduxjs/toolkit").EnhancedStore<State, import("redux").AnyAction, import("@reduxjs/toolkit").MiddlewareArray<[import("redux-thunk").ThunkMiddleware<State, import("redux").AnyAction, undefined>]>>;
export default storeStreams;
