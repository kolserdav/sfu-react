/* eslint-disable max-classes-per-file */
/* eslint-disable no-unused-vars */
export enum MessageType {
  USER_ID = 'USER_ID',
  USER_KEY = 'USER_KEY',
  OFFER = 'OFFER',
  CANDIDATE = 'CANDIDATE',
}

interface MessageAll {
  key: string;
}

interface Message {
  id: number;
  sdp: string;
}

type UserId = Pick<Message, 'id'>;

type UserKey = MessageAll;

type Offer = Pick<Message, 'sdp' | 'id'>;

type Candidate = Pick<Message, 'sdp' | 'id'>;

export type MessageSubset<T> = T extends MessageType.OFFER
  ? Offer
  : T extends MessageType.CANDIDATE
  ? Candidate
  : T extends MessageType.USER_ID
  ? UserId
  : T extends MessageType.USER_KEY
  ? UserKey
  : unknown;

export type MessageFull<T> = {
  type: T;
  data: MessageAll & MessageSubset<T>;
};

export abstract class WSInterface {
  public abstract connection: any;

  public abstract createConnection(args: any): any;

  public abstract parseMessage(text: string): MessageSubset<any>;

  public abstract getMessage<T extends keyof typeof MessageType>(
    message: MessageSubset<any>
  ): MessageSubset<T>;

  public abstract sendMessage: <T extends keyof typeof MessageType>(args: MessageFull<T>) => 1 | 0;
}
