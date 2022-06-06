/* eslint-disable max-classes-per-file */
/* eslint-disable no-unused-vars */
import { Prisma, User, PrismaPromise } from './prisma';

export type Awaited<T> = T extends PromiseLike<infer U> ? U : T;

export enum MessageType {
  GET_USER_ID = 'GET_USER_ID',
  SET_USER_ID = 'SET_USER_ID',
  GET_LOGIN = 'GET_LOGIN',
  TOKEN = 'TOKEN',
  OFFER = 'OFFER',
  CANDIDATE = 'CANDIDATE',
  ANSWER = 'ANSWER',
  GET_USER_FINDFIRST = 'GET_USER_FINDFIRST',
  SET_USER_FIND_FIRST = 'SET_USER_FIND_FIRST',
  GET_USER_CREATE = 'GET_USER_CREATE',
  SET_USER_CREATE = 'SET_USER_CREATE',
}

interface MessageAll {
  type: keyof typeof MessageType;
}

interface MessageData {
  id: number;
  sdp: string;
  candidate: any;
  token: string;
  args: any;
  argv: any;
}

type GetUserId = Pick<MessageData, 'id'>;
type SetUserId = Pick<MessageData, 'id'>;
type Offer = Pick<MessageData, 'sdp'>;
type Candidate = Pick<MessageData, 'candidate'>;
type Answer = Pick<MessageData, 'sdp'>;
type GetUserFindFirst = Pick<MessageData, 'token' | 'args'>;
type SetUserFindFirst = Pick<MessageData, 'argv'>;
type GetUserCreate = Pick<MessageData, 'args' | 'token'>;
type SetUserCreate = Pick<MessageData, 'argv'>;

export type ArgsSubset<T> = T extends MessageType.OFFER
  ? Offer
  : T extends MessageType.ANSWER
  ? Answer
  : T extends MessageType.CANDIDATE
  ? Candidate
  : T extends MessageType.GET_USER_ID
  ? GetUserId
  : T extends MessageType.SET_USER_ID
  ? SetUserId
  : T extends MessageType.GET_USER_FINDFIRST
  ? GetUserFindFirst
  : T extends MessageType.SET_USER_FIND_FIRST
  ? SetUserFindFirst
  : T extends MessageType.GET_USER_CREATE
  ? GetUserCreate
  : T extends MessageType.SET_USER_CREATE
  ? SetUserCreate
  : T extends MessageType.GET_USER_FINDFIRST
  ? Prisma.UserFindFirstArgs
  : T extends MessageType.SET_USER_FIND_FIRST
  ? User
  : T extends MessageType.GET_USER_CREATE
  ? Prisma.UserCreateArgs
  : User;

export abstract class RTCInterface {
  public abstract roomId: string;

  public abstract userId: number;

  public abstract rtc: RTCPeerConnection;

  public abstract createRTC(args: { id: number }): RTCPeerConnection;
}

export abstract class WSInterface {
  public abstract connection: any;

  public abstract createConnection(args: any): any;

  public abstract parseMessage(text: string): (ArgsSubset<any> & MessageAll) | null;

  public abstract getMessage<T extends keyof typeof MessageType>(
    type: T,
    message: ArgsSubset<any>
  ): ArgsSubset<T>;

  public abstract sendMessage: <T extends keyof typeof MessageType>(args: {
    type: T;
    data: ArgsSubset<T>;
    connection?: any;
  }) => Promise<1 | 0>;
}

export abstract class DBInterface {
  public abstract userCreate<T extends Prisma.UserCreateArgs>(
    args: Prisma.SelectSubset<T, Prisma.UserCreateArgs>
  ): Promise<Prisma.CheckSelect<T, User | null, Prisma.UserGetPayload<T>>>;

  public abstract userFindFirst<T extends Prisma.UserFindFirstArgs>(
    args: Prisma.SelectSubset<T, Prisma.UserFindFirstArgs>
  ): Promise<Prisma.CheckSelect<T, User | null, Prisma.UserGetPayload<T>>>;
}
