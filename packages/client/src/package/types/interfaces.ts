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

type GetUserId = undefined;
type SetUserId = undefined;
type Offer = any;
type Candidate = any;
type Answer = any;
interface GetUserFindFirst {
  args: Prisma.UserFindFirstArgs;
}
interface SetUserFindFirst {
  argv: User | null;
}
interface GetUserCreate {
  args: Prisma.UserCreateArgs;
}
interface SetUserCreate {
  argv: User | null;
}

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
  ? GetUserFindFirst
  : T extends MessageType.SET_USER_FIND_FIRST
  ? SetUserFindFirst
  : T extends MessageType.GET_USER_CREATE
  ? SetUserCreate
  : unknown;

export abstract class RTCInterface {
  public abstract roomId: string;

  public abstract userId: number;

  public abstract rtc: RTCPeerConnection;

  public abstract createRTC(args: { id: number }): RTCPeerConnection;
}

interface SendMessageArgs<T> {
  type: T;
  id: number;
  token: string;
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
    args: SendMessageArgs<T>,
    connection?: any
  ) => Promise<1 | 0>;
}

export abstract class DBInterface {
  public abstract userCreate<T extends Prisma.UserCreateArgs>(
    args: Prisma.SelectSubset<T, Prisma.UserCreateArgs>,
    _connection?: WebSocket
  ): Promise<Prisma.CheckSelect<T, User, Prisma.UserGetPayload<T>> | null>;

  public abstract userFindFirst<T extends Prisma.UserFindFirstArgs>(
    args: Prisma.SelectSubset<T, Prisma.UserFindFirstArgs>,
    _connection?: WebSocket
  ): Promise<Prisma.CheckSelect<T, User, Prisma.UserGetPayload<T>> | null>;
}
