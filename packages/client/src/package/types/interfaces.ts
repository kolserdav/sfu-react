/* eslint-disable max-classes-per-file */
/* eslint-disable no-unused-vars */
import { Prisma, User, PrismaPromise } from './prisma';

export type Awaited<T> = T extends PromiseLike<infer U> ? U : T;

export enum MessageType {
  GET_USER_ID = 'GET_USER_ID',
  SET_USER_ID = 'SET_USER_ID',
  GET_LOGIN = 'GET_LOGIN',
  TOKEN = 'TOKEN',
  GET_USER_FINDFIRST = 'GET_USER_FINDFIRST',
  SET_USER_FIND_FIRST = 'SET_USER_FIND_FIRST',
  GET_USER_CREATE = 'GET_USER_CREATE',
  SET_USER_CREATE = 'SET_USER_CREATE',
  OFFER = 'OFFER',
  CANDIDATE = 'CANDIDATE',
  ANSWER = 'ANSWER',
}

interface MessageData {
  id: number;
  sdp: string;
  candidate: any;
  token: string;
  args: Record<string, any>;
}

type GetUserId = Pick<MessageData, 'id'>;
type Offer = Pick<MessageData, 'sdp'>;
type Candidate = Pick<MessageData, 'candidate'>;
type Answer = Pick<MessageData, 'sdp'>;
type GetUserFindFirst = Pick<MessageData, 'token' | 'args'>;
type SetUserFindFirst = Pick<MessageData, 'args'>;
type GetUserCreate = Pick<MessageData, 'args' | 'token'>;

export type MessageSubset<T> = T extends MessageType.OFFER
  ? Offer
  : T extends MessageType.ANSWER
  ? Answer
  : T extends MessageType.CANDIDATE
  ? Candidate
  : T extends MessageType.GET_USER_ID
  ? GetUserId
  : T extends MessageType.GET_USER_FINDFIRST
  ? GetUserFindFirst
  : T extends MessageType.SET_USER_FIND_FIRST
  ? SetUserFindFirst
  : T extends MessageType.GET_USER_CREATE
  ? GetUserCreate
  : Record<string, any>;

export type ArgsSubset<T extends keyof typeof MessageType> =
  T extends MessageType.GET_USER_FINDFIRST
    ? Prisma.UserFindFirstArgs
    : T extends MessageType.SET_USER_FIND_FIRST
    ? User | null
    : T extends MessageType.GET_USER_CREATE
    ? Prisma.UserCreateArgs
    : T extends MessageType.SET_USER_CREATE
    ? User | null
    : Record<string, any>;

export abstract class RTCInterface {
  public abstract roomId: string;

  public abstract userId: number;

  public abstract rtc: RTCPeerConnection;

  public abstract createRTC(args: { id: number }): RTCPeerConnection;
}

export abstract class WSInterface {
  public abstract connection: any;

  public abstract createConnection(args: any): any;

  public abstract parseMessage(
    text: string
  ): (MessageSubset<any> & { type: keyof typeof MessageType }) | null;

  public abstract getMessage<T extends keyof typeof MessageType>(
    message: MessageSubset<any>
  ): MessageSubset<T>;

  public abstract sendMessage: <T extends keyof typeof MessageType>(args: {
    type: T;
    data: MessageSubset<T>;
    connection?: any;
  }) => Promise<1 | 0>;
}

export abstract class DBInterface {
  public abstract userCreate<T extends Prisma.UserCreateArgs>(
    args: Prisma.SelectSubset<T, Prisma.UserCreateArgs>
  ): Prisma.CheckSelect<T, User | null, PrismaPromise<Prisma.UserGetPayload<T>>>;

  public abstract userFindFirst<T extends Prisma.UserFindFirstArgs>(
    args: Prisma.SelectSubset<T, Prisma.UserFindFirstArgs>
  ): Prisma.CheckSelect<T, User | null, PrismaPromise<Prisma.UserGetPayload<T>>>;
}
