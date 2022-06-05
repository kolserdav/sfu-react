/* eslint-disable max-classes-per-file */
/* eslint-disable no-unused-vars */

export enum MessageType {
  /**
   * Client get yourself id
   */
  USER_ID = 'USER_ID',
  /**
   * Server send userId
   */
  USER_KEY = 'USER_KEY',
  /**
   * Client get token
   */
  LOGIN = 'LOGIN',
  /**
   * Server send token
   */
  TOKEN = 'TOKEN',
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

type UserId = { id: 0 };

type Offer = Pick<Message, 'sdp'>;

type Candidate = Pick<Message, 'candidate'>;

type Answer = Pick<Message, 'sdp'>;

export type MessageSubset<T> = MessageAll &
  (T extends MessageType.OFFER
    ? Offer
    : T extends MessageType.CANDIDATE
    ? Candidate
    : T extends MessageType.USER_ID
    ? UserId
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
  ) => 1 | 0;
}
