/* eslint-disable max-classes-per-file */
/* eslint-disable no-unused-vars */

export type Awaited<T> = T extends PromiseLike<infer U> ? U : T;

export enum MessageType {
  GET_USER_ID = 'GET_USER_ID',
  SET_USER_ID = 'SET_USER_ID',
  GET_LOGIN = 'GET_LOGIN',
  TOKEN = 'TOKEN',
  OFFER = 'OFFER',
  CANDIDATE = 'CANDIDATE',
  ANSWER = 'ANSWER',
  GET_ROOM = 'GET_ROOM',
  SET_ROOM = 'SET_ROOM',
  SET_ERROR = 'SET_ERROR',
  SET_CHANGE_ROOM_GUESTS = 'SET_CHANGE_ROOM_GUESTS',
}

type GetGuestId = {
  isRoom?: boolean;
};
type SetGuestId = undefined;
type GetRoom = {
  userId: number;
};
type SetChangeRoomGuests = {
  roomUsers: number[];
};
type SetRoom = undefined;
type SetError = {
  message: string;
};
interface GetAuth {
  email: string;
}
interface SetAuth {
  message: string;
}
type Offer = {
  sdp: RTCSessionDescriptionInit;
  userId: number;
  target: number;
};
type Candidate = {
  candidate: any;
  userId: number;
  target: number;
};
type Answer = {
  sdp: RTCSessionDescriptionInit;
  userId: number;
  target: number;
};

export type ArgsSubset<T> = T extends MessageType.OFFER
  ? Offer
  : T extends MessageType.ANSWER
  ? Answer
  : T extends MessageType.CANDIDATE
  ? Candidate
  : T extends MessageType.GET_USER_ID
  ? GetGuestId
  : T extends MessageType.SET_USER_ID
  ? SetGuestId
  : T extends MessageType.GET_ROOM
  ? GetRoom
  : T extends MessageType.SET_ROOM
  ? SetRoom
  : T extends MessageType.SET_CHANGE_ROOM_GUESTS
  ? SetChangeRoomGuests
  : T extends MessageType.SET_ERROR
  ? SetError
  : unknown;

export abstract class RTCInterface {
  public abstract peerConnections: Record<string, RTCPeerConnection>;

  public abstract createRTC(args: {
    id: number;
    userId: number;
    target: number;
  }): Record<number, RTCPeerConnection>;

  public abstract handleIceCandidate({
    roomId,
    userId,
    target,
  }: {
    roomId: number;
    userId: number;
    target: number;
  }): void;

  public abstract closeVideoCall({
    roomId,
    userId,
    target,
  }: {
    roomId: number;
    userId: number;
    target: number;
  }): void;

  public abstract onAddTrack(userId: number, stream: MediaStream): void;

  public abstract handleOfferMessage(
    msg: SendMessageArgs<MessageType.OFFER>,
    cb?: (desc: RTCSessionDescription | null) => any
  ): void;

  public abstract handleCandidateMessage(
    msg: SendMessageArgs<MessageType.CANDIDATE>,
    cb?: (cand: RTCIceCandidate | null) => any
  ): void;

  public abstract handleVideoAnswerMsg(
    msg: SendMessageArgs<MessageType.ANSWER>,
    cb?: (res: 1 | 0) => any
  ): void;
}

export interface SendMessageArgs<T> {
  type: T;
  id: number;
  isAuth?: boolean;
  data: ArgsSubset<T>;
}

export abstract class WSInterface {
  public abstract connection: any;

  public abstract createConnection(args: any): any;

  public abstract parseMessage(text: string): SendMessageArgs<any> | null;

  public abstract getMessage<T extends keyof typeof MessageType>(
    type: T,
    message: SendMessageArgs<any>
  ): SendMessageArgs<T>;

  public abstract sendMessage: <T extends keyof typeof MessageType>(
    args: SendMessageArgs<T>
  ) => Promise<1 | 0>;
}
