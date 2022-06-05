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

export interface MessageAll {
  type: keyof typeof MessageType;
  id: number;
}

interface Message {
  sdp: string;
  candidate: any;
}

type GetUserId = { id: number };

type Offer = Pick<Message, 'sdp'>;

type Candidate = Pick<Message, 'candidate'>;

type Answer = Pick<Message, 'sdp'>;

export type MessageSubset<T> = MessageAll &
  (T extends MessageType.OFFER
    ? Offer
    : T extends MessageType.CANDIDATE
    ? Candidate
    : T extends MessageType.GET_USER_ID
    ? GetUserId
    : T extends MessageType.ANSWER
    ? Answer
    : Record<string, any>);

export abstract class RTCInterface {
  public abstract roomId: string;

  public abstract userId: number;

  public abstract rtc: RTCPeerConnection;

  public abstract createRTC(args: { id: number }): RTCPeerConnection;
}

export abstract class WSInterface {
  public abstract connection: any;

  public abstract createConnection(args: any): any;

  public abstract parseMessage(text: string): MessageSubset<any> | null;

  public abstract getMessage<T extends keyof typeof MessageType>(
    message: MessageSubset<any>
  ): MessageSubset<T>;

  public abstract sendMessage: <T extends keyof typeof MessageType>(
    args: MessageSubset<T>
  ) => Promise<1 | 0>;
}

type SelectAndInclude = {
  select: any;
  include: any;
};
type HasSelect = {
  select: any;
};
type HasInclude = {
  include: any;
};
type CheckSelect<T, S, U> = T extends SelectAndInclude
  ? 'Please either choose `select` or `include`'
  : T extends HasSelect
  ? U
  : T extends HasInclude
  ? U
  : S;

export abstract class DBInterface {
  /*
  public abstract userCreate<T extends Prisma.UserCreateArgs>(
    args: Prisma.SelectSubset<T, Prisma.UserCreateArgs>
  ): Promise<Prisma.CheckSelect<T, User | null, PrismaPromise<Prisma.UserGetPayload<T>>>>;
*/
  public abstract userFindFirst<T extends Prisma.UserFindFirstArgs>(
    args: Prisma.SelectSubset<T, Prisma.UserFindFirstArgs>
  ): Promise<Prisma.CheckSelect<T, User | null, PrismaPromise<Prisma.UserGetPayload<T>>>>;
}
