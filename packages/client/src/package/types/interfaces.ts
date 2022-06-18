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
  userId: number | string;
};
type SetChangeRoomGuests = {
  roomUsers: (number | string)[];
};
type SetRoom = undefined;
type SetError = {
  message: string;
};
type Offer = {
  sdp: RTCSessionDescriptionInit;
  userId: number | string;
  target: number | string;
};
type Candidate = {
  candidate: RTCIceCandidate;
  userId: number | string;
  target: number | string;
};
type Answer = {
  sdp: RTCSessionDescriptionInit;
  userId: number | string;
  target: number | string;
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

  public readonly delimiter = '_';

  public abstract createRTC(args: {
    connId: string;
    roomId: number | string;
    userId: number | string;
    target: string | number;
  }): Record<number, RTCPeerConnection>;

  public abstract handleIceCandidate({
    connId,
    roomId,
    userId,
    target,
  }: {
    connId: string;
    roomId: number | string;
    userId: number | string;
    target: string | number;
  }): void;

  public abstract getPeerId(...args: (number | string)[]): string;

  public abstract closeVideoCall({
    connId,
    roomId,
    userId,
    target,
  }: {
    connId: string;
    roomId: number | string;
    userId: number | string;
    target: string | number;
  }): void;

  public abstract onClosedCall({
    connId,
    roomId,
    userId,
    target,
  }: {
    connId: string;
    roomId: number | string;
    userId: number | string;
    target: string | number;
  }): void;

  public abstract onAddTrack(target: number | string, stream: MediaStream): void;

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
type ConnectionId<T> = T extends infer R ? R : never;
export interface SendMessageArgs<T> {
  type: T;
  id: number | string;
  data: ArgsSubset<T>;
  connId?: ConnectionId<string>;
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
