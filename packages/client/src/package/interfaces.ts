/* eslint-disable max-classes-per-file */
/* eslint-disable no-unused-vars */
export enum MessageType {
  /**
   * User get yourself id
   */
  USER_ID = 'USER_ID',
  /**
   * Server send userId
   */
  USER_KEY = 'USER_KEY',
  OFFER = 'OFFER',
  CANDIDATE = 'CANDIDATE',
}

export interface MessageAll {
  id: number;
}

interface Message {
  sdp: string;
}

type UserId = { id: 0 };

type UserKey = MessageAll;

type Offer = Pick<Message, 'sdp'>;

type Candidate = Pick<Message, 'sdp'>;

export type MessageSubset<T> = T extends MessageType.OFFER
  ? Offer
  : T extends MessageType.CANDIDATE
  ? Candidate
  : T extends MessageType.USER_ID
  ? UserId
  : T extends MessageType.USER_ID
  ? UserKey
  : Record<string, any>;

export type MessageFull<T> = {
  type: T;
  data: MessageSubset<T>;
};

export abstract class WSInterface {
  public abstract connection: any;

  public abstract createConnection(args: any): any;

  public abstract parseMessage(text: string): MessageFull<any> | null;

  public abstract getMessage<T extends keyof typeof MessageType>(
    message: MessageSubset<any>
  ): MessageSubset<T>;

  public abstract sendMessage: <T extends keyof typeof MessageType>(args: MessageFull<T>) => 1 | 0;
}
