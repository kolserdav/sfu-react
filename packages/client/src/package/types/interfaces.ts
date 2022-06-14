/* eslint-disable max-classes-per-file */
/* eslint-disable no-unused-vars */
import { Prisma, Guest } from './prisma';

export type Awaited<T> = T extends PromiseLike<infer U> ? U : T;

export enum MessageType {
  GET_USER_ID = 'GET_USER_ID',
  SET_USER_ID = 'SET_USER_ID',
  GET_LOGIN = 'GET_LOGIN',
  TOKEN = 'TOKEN',
  OFFER = 'OFFER',
  CANDIDATE = 'CANDIDATE',
  ANSWER = 'ANSWER',
  GET_AUTH = 'GET_AUTH',
  SET_AUTH = 'SET_AUTH',
  GET_GUEST_FIND_FIRST = 'GET_GUEST_FIND_FIRST',
  SET_GUEST_FIND_FIRST = 'SET_GUEST_FIND_FIRST',
  GET_GUEST_CREATE = 'GET_GUEST_CREATE',
  SET_GUEST_CREATE = 'SET_GUEST_CREATE',
  GET_GUEST_UPDATE = 'GET_GUEST_UPDATE',
  SET_GUEST_UPDATE = 'SET_GUEST_UPDATE',
  GET_ROOM = 'GET_ROOM',
  SET_ROOM = 'SET_ROOM',
  SET_ERROR = 'SET_ERROR',
}

type GetGuestId = {
  isRoom?: boolean;
};
type SetGuestId = undefined;
type GetRoom = {
  userId: number;
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
};
type Candidate = {
  candidate: any;
  userId: number;
};
type Answer = {
  sdp: RTCSessionDescriptionInit;
  userId: number;
};
interface GetGuestFindFirst {
  args: Prisma.GuestFindFirstArgs;
}
interface SetGuestFindFirst {
  argv: Guest | null;
}
interface GetGuestCreate {
  args: Prisma.GuestCreateArgs;
}
interface SetGuestCreate {
  argv: Guest | null;
}
interface GetGuestUpdate {
  args: Prisma.GuestUpdateArgs;
}
interface SetGuestUpdate {
  argv: Guest | null;
}

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
  : T extends MessageType.GET_AUTH
  ? GetAuth
  : T extends MessageType.SET_AUTH
  ? SetAuth
  : T extends MessageType.GET_GUEST_FIND_FIRST
  ? GetGuestFindFirst
  : T extends MessageType.SET_GUEST_FIND_FIRST
  ? SetGuestFindFirst
  : T extends MessageType.GET_GUEST_CREATE
  ? GetGuestCreate
  : T extends MessageType.SET_GUEST_CREATE
  ? SetGuestCreate
  : T extends MessageType.SET_GUEST_FIND_FIRST
  ? SetGuestFindFirst
  : T extends MessageType.GET_GUEST_CREATE
  ? SetGuestCreate
  : T extends MessageType.GET_GUEST_UPDATE
  ? GetGuestUpdate
  : T extends MessageType.SET_GUEST_UPDATE
  ? SetGuestUpdate
  : T extends MessageType.SET_ERROR
  ? SetError
  : unknown;

export abstract class RTCInterface {
  public abstract peerConnections: Record<number, RTCPeerConnection>;

  public abstract createRTC(args: { id: number }): Record<number, RTCPeerConnection>;

  public abstract handleIceCandidate({
    targetUserId,
    userId,
  }: {
    targetUserId: number;
    userId: number;
  }): void;

  public abstract closeVideoCall({ targetUserId }: { targetUserId: number }): void;

  public abstract handleOfferMessage(
    msg: SendMessageArgs<MessageType.OFFER>,
    cb: (desc: RTCSessionDescription | null) => any
  ): void;

  public abstract handleCandidateMessage(
    msg: SendMessageArgs<MessageType.CANDIDATE>,
    cb?: (cand: RTCIceCandidate | null) => any
  ): void;

  public abstract handleVideoAnswerMsg(
    msg: SendMessageArgs<MessageType.ANSWER>,
    cb: (res: 1 | 0) => any
  ): void;
}

export interface SendMessageArgs<T> {
  type: T;
  id: number;
  token: string;
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

export abstract class DBInterface {
  public abstract guestCreate<T extends Prisma.GuestCreateArgs>(
    args: Prisma.SelectSubset<T, Prisma.GuestCreateArgs>
  ): Promise<Prisma.CheckSelect<T, Guest, Prisma.GuestGetPayload<T>> | null>;

  public abstract guestUpdate<T extends Prisma.GuestUpdateArgs>(
    args: Prisma.SelectSubset<T, Prisma.GuestUpdateArgs>
  ): Promise<Prisma.CheckSelect<T, Guest, Prisma.GuestGetPayload<T>> | null>;

  public abstract guestFindFirst<T extends Prisma.GuestFindFirstArgs>(
    args: Prisma.SelectSubset<T, Prisma.GuestFindFirstArgs>
  ): Promise<Prisma.CheckSelect<T, Guest, Prisma.GuestGetPayload<T>> | null>;
}
