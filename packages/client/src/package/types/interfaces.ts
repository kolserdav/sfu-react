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
  OFFER = 'OFFER',
  CANDIDATE = 'CANDIDATE',
  ANSWER = 'ANSWER',
}

export abstract class DBInterface {
  public abstract userCreate<T extends Prisma.UserCreateArgs>(
    args: Prisma.SelectSubset<T, Prisma.UserCreateArgs>
  ): Promise<Prisma.CheckSelect<T, User | null, PrismaPromise<Prisma.UserGetPayload<T>>>>;

  public abstract userFindFirst<T extends Prisma.UserFindFirstArgs>(
    args: Prisma.SelectSubset<T, Prisma.UserFindFirstArgs>
  ): Promise<Prisma.CheckSelect<T, User | null, PrismaPromise<Prisma.UserGetPayload<T>>>>;
}

interface MessageData {
  id: number;
  sdp: string;
  candidate: any;
  token: string;
  userFindFirst: Prisma.UserFindFirstArgs;
}

type GetUserId = Pick<MessageData, 'id'>;

type Offer = Pick<MessageData, 'sdp'>;

type Candidate = Pick<MessageData, 'candidate'>;

type Answer = Pick<MessageData, 'sdp'>;

type GetUserFindFirst = Pick<MessageData, 'token' | 'userFindFirst'>;

export type MessageSubset<T> = T extends MessageType.OFFER
  ? Offer
  : T extends MessageType.CANDIDATE
  ? Candidate
  : T extends MessageType.GET_USER_ID
  ? GetUserId
  : T extends MessageType.ANSWER
  ? Answer
  : T extends MessageType.GET_USER_FINDFIRST
  ? GetUserFindFirst
  : unknown;

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
