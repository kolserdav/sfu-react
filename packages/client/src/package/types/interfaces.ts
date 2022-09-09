/******************************************************************************************
 * Repository: https://github.com/kolserdav/werift-sfu-react.git
 * File name: interfaces.ts
 * Author: Sergey Kolmiller
 * Email: <uyem.ru@gmail.com>
 * License: MIT
 * License text: See in LICENSE file
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Wed Aug 24 2022 14:14:09 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable max-classes-per-file */
/* eslint-disable no-unused-vars */
import * as werift from 'werift';
import { Message, Prisma, Room, Unit, Video } from '@prisma/client';

export type LocaleValue = 'en' | 'ru';
export interface UserItem {
  name: string;
  connId: string;
  locale: LocaleValue;
}
export interface RoomUser {
  id: string | number;
  name: string;
  isOwner: boolean;
}
export interface UserList extends RoomUser {
  muted: boolean;
  adminMuted: boolean;
}
export type RoomList = Record<string, (string | number)[]>;
export type Banneds = Record<string, RoomUser[]>;
// eslint-disable-next-line @typescript-eslint/ban-types
export type ArgumentTypes<F extends Function> = F extends (args: infer A) => any ? A : never;
export type GetManyResult<T> = { result: T[]; skip: number; count: number; take: number };
export type MessageFull = Message & {
  Unit: {
    name: string;
  };
};

export enum ErrorCode {
  initial = 'initial',
  roomIsInactive = 'roomIsInactive',
  errorSendMessage = 'errorSendMessage',
  youAreBanned = 'youAreBanned',
  videoRecordStop = 'videoRecordStop',
}

// eslint-disable-next-line no-unused-vars
export enum LogLevel {
  // eslint-disable-next-line no-unused-vars
  log = 0,
  // eslint-disable-next-line no-unused-vars
  info = 1,
  // eslint-disable-next-line no-unused-vars
  warn = 2,
  // eslint-disable-next-line no-unused-vars
  error = 3,
}

export enum RecordCommand {
  start = 'start',
  stop = 'stop',
}

// eslint-disable-next-line no-shadow
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
  GET_CHAT_UNIT = 'GET_CHAT_UNIT',
  SET_ERROR = 'SET_ERROR',
  GET_ROOM_GUESTS = 'GET_ROOM_GUESTS',
  SET_ROOM_GUESTS = 'SET_ROOM_GUESTS',
  SET_CHANGE_UNIT = 'SET_CHANGE_UNIT',
  GET_MUTE = 'GET_MUTE',
  SET_MUTE = 'SET_MUTE',
  GET_NEED_RECONNECT = 'GET_NEED_RECONNECT',
  GET_CLOSE_PEER_CONNECTION = 'GET_CLOSE_PEER_CONNECTION',
  SET_CLOSE_PEER_CONNECTION = 'SET_CLOSE_PEER_CONNECTION',
  GET_ROOM_MESSAGE = 'GET_ROOM_MESSAGE',
  SET_ROOM_MESSAGE = 'SET_ROOM_MESSAGE',
  SET_CHAT_UNIT = 'SET_CHAT_UNIT',
  GET_CHAT_MESSAGES = 'GET_CHAT_MESSAGES',
  SET_CHAT_MESSAGES = 'SET_CHAT_MESSAGES',
  GET_EDIT_MESSAGE = 'GET_EDIT_MESSAGE',
  SET_EDIT_MESSAGE = 'SET_EDIT_MESSAGE',
  GET_DELETE_MESSAGE = 'GET_DELETE_MESSAGE',
  SET_DELETE_MESSAGE = 'SET_DELETE_MESSAGE',
  GET_LOCALE = 'GET_LOCALE',
  SET_LOCALE = 'SET_LOCALE',
  GET_TO_MUTE = 'GET_TO_MUTE',
  GET_TO_BAN = 'GET_TO_BAN',
  GET_TO_UNMUTE = 'GET_TO_UNMUTE',
  GET_TO_UNBAN = 'GET_TO_UNBAN',
  SET_BAN_LIST = 'SET_BAN_LIST',
  SET_MUTE_LIST = 'SET_MUTE_LIST',
  GET_RECORD = 'GET_RECORD',
  SET_RECORDING = 'SET_RECORDING',
}

export namespace Locale {
  export const DEFAULT: LocaleValue = 'en';
  // Implements on packages/server/src/utils/lib.ts
  export const SELECTOR: { value: LocaleValue; name: string; impl: boolean }[] = [
    {
      name: 'English',
      value: 'en',
      impl: true,
    },
    {
      name: 'Русский',
      value: 'ru',
      impl: true,
    },
  ];
  export interface Server {
    error: string;
    roomInactive: string;
    errorSendMessage: string;
    youAreBanned: string;
    videoRecordStop: string;
  }

  export interface Client {
    shareScreen: string;
    changeTheme: string;
    send: string;
    quote: string;
    edit: string;
    delete: string;
    errorGetCamera: string;
    errorGetDisplay: string;
    erorGetSound: string;
    edited: string;
    noMessages: string;
    loading: string;
    getDisplayCancelled: string;
    mute: string;
    unmute: string;
    ban: string;
    unban: string;
    isAdminOfRoom: string;
    youAreAdminOfRoom: string;
    banneds: string;
    recordVideo: string;
    videoRecording: string;
    recordVideoStop: string;
    linkCopied: string;
    generalSettings: string;
    recordActions: string;
    changeLang: string;
    darkTheme: string;
    startRecord: string;
    recording: string;
    stopRecord: string;
  }
}

export type LocaleServer = {
  server: Locale.Server;
  client: Locale.Client;
};
export const LocaleDefault = Locale.DEFAULT;
export const LocaleSelector = Locale.SELECTOR;

export namespace DataTypes {
  export namespace MessageTypes {
    export type GetMute = {
      muted: boolean;
      roomId: string | number;
    };
    export type GetNeedReconnect = {
      userId: string | number;
    };
    export type GetRoomGuests = {
      roomId: number | string;
    };
    export type GetChatUnit = {
      userId: string | number;
      locale: LocaleValue;
    };
    export type GetLocale = {
      locale: LocaleValue;
    };
    export type GetClosePeerConnection = {
      roomId: number | string;
      target: number | string;
    };
    export type GetUserId = {
      isRoom?: boolean;
      userName: string;
      locale: LocaleValue;
    };
    export type SetChangeRoomUnit = {
      target: number | string;
      name: string;
      eventName: 'delete' | 'add' | 'added';
      roomLength: number;
      isOwner: boolean;
      muteds: (string | number)[];
      adminMuteds: (string | number)[];
    };
    export type SetUserId = {
      name: string;
    };
    export type GetRoom = {
      userId: number | string;
      mimeType: string;
    };
    export type GetToMute = {
      target: string | number;
    };
    export type GetToBan = {
      target: string | number;
      userId: string | number;
    };
    export type GetToUnMute = {
      target: string | number;
    };
    export type GetToUnBan = {
      target: string | number;
      userId: string | number;
    };
    export type SetRoomGuests = {
      roomUsers: RoomUser[];
      muteds: (string | number)[];
      adminMuteds: (string | number)[];
    };
    export type GetChatMessages = {
      args: Prisma.MessageFindManyArgs;
      userId: string | number;
    };
    export type GetEditMessage = {
      args: Prisma.MessageUpdateArgs;
      userId: string | number;
    };
    export type GetRecord = {
      command: keyof typeof RecordCommand;
      userId: string | number;
    };
    export type GetDeleteMessage = {
      args: Prisma.MessageDeleteArgs;
      userId: string | number;
    };
    export type SetRoom = {
      isOwner: boolean;
    };
    export type SetBanList = {
      banneds: Banneds[any];
    };
    export type SetMuteList = {
      muteds: RoomList[any];
      adminMuteds: RoomList[any];
    };
    export type SetError = {
      message: string;
      // eslint-disable-next-line no-use-before-define
      type: keyof typeof LogLevel;
      code: keyof typeof ErrorCode;
    };
    export type SetMute = {
      muteds: (string | number)[];
      adminMuteds: (string | number)[];
    };
    export type SetLocale = {
      locale: LocaleServer['client'];
    };
    export type GetRoomMessage = {
      userId: string | number;
      message: string;
    };
    export type SetRecording = {
      command: keyof typeof RecordCommand;
      time: number;
    };
    export type SetRoomMessage = MessageFull;
    export type SetEditMessage = MessageFull;
    export type SetDeleteMessage = MessageFull;
    export type SetChatMessages = GetManyResult<MessageFull>;
    export type SetClosePeerConnection = {
      roomId: number | string;
      target: number | string;
    };
    export type Offer = {
      sdp: RTCSessionDescriptionInit;
      userId: number | string;
      target: number | string;
      mimeType: string;
      roomId: number | string;
    };
    export type Candidate = {
      candidate: RTCIceCandidate;
      userId: number | string;
      target: number | string;
      roomId: number | string;
    };
    export type Answer = {
      sdp: RTCSessionDescriptionInit;
      userId: number | string;
      target: number | string;
    };
    export type SetChatUnit = undefined;
    export type ConnectionId<T> = T extends infer R ? R : never;
  }

  export type ArgsSubset<T> = T extends MessageType.OFFER
    ? DataTypes.MessageTypes.Offer
    : T extends MessageType.ANSWER
    ? DataTypes.MessageTypes.Answer
    : T extends MessageType.CANDIDATE
    ? DataTypes.MessageTypes.Candidate
    : T extends MessageType.GET_MUTE
    ? DataTypes.MessageTypes.GetMute
    : T extends MessageType.GET_NEED_RECONNECT
    ? DataTypes.MessageTypes.GetNeedReconnect
    : T extends MessageType.GET_CLOSE_PEER_CONNECTION
    ? DataTypes.MessageTypes.GetClosePeerConnection
    : T extends MessageType.GET_USER_ID
    ? DataTypes.MessageTypes.GetUserId
    : T extends MessageType.SET_USER_ID
    ? DataTypes.MessageTypes.SetUserId
    : T extends MessageType.GET_CHAT_UNIT
    ? DataTypes.MessageTypes.GetChatUnit
    : T extends MessageType.GET_ROOM
    ? DataTypes.MessageTypes.GetRoom
    : T extends MessageType.GET_TO_MUTE
    ? DataTypes.MessageTypes.GetToMute
    : T extends MessageType.GET_TO_BAN
    ? DataTypes.MessageTypes.GetToBan
    : T extends MessageType.GET_TO_UNMUTE
    ? DataTypes.MessageTypes.GetToUnMute
    : T extends MessageType.GET_TO_UNBAN
    ? DataTypes.MessageTypes.GetToUnBan
    : T extends MessageType.GET_RECORD
    ? DataTypes.MessageTypes.GetRecord
    : T extends MessageType.SET_ROOM
    ? DataTypes.MessageTypes.SetRoom
    : T extends MessageType.GET_LOCALE
    ? DataTypes.MessageTypes.GetLocale
    : T extends MessageType.GET_ROOM_GUESTS
    ? DataTypes.MessageTypes.GetRoomGuests
    : T extends MessageType.GET_CHAT_MESSAGES
    ? DataTypes.MessageTypes.GetChatMessages
    : T extends MessageType.SET_ROOM_GUESTS
    ? DataTypes.MessageTypes.SetRoomGuests
    : T extends MessageType.SET_CHANGE_UNIT
    ? DataTypes.MessageTypes.SetChangeRoomUnit
    : T extends MessageType.SET_MUTE
    ? DataTypes.MessageTypes.SetMute
    : T extends MessageType.SET_CHAT_UNIT
    ? DataTypes.MessageTypes.SetChatUnit
    : T extends MessageType.SET_CHAT_MESSAGES
    ? DataTypes.MessageTypes.SetChatMessages
    : T extends MessageType.GET_ROOM_MESSAGE
    ? DataTypes.MessageTypes.GetRoomMessage
    : T extends MessageType.GET_EDIT_MESSAGE
    ? DataTypes.MessageTypes.GetEditMessage
    : T extends MessageType.SET_EDIT_MESSAGE
    ? DataTypes.MessageTypes.SetEditMessage
    : T extends MessageType.GET_DELETE_MESSAGE
    ? DataTypes.MessageTypes.GetDeleteMessage
    : T extends MessageType.SET_DELETE_MESSAGE
    ? DataTypes.MessageTypes.SetDeleteMessage
    : T extends MessageType.SET_ROOM_MESSAGE
    ? DataTypes.MessageTypes.SetRoomMessage
    : T extends MessageType.SET_BAN_LIST
    ? DataTypes.MessageTypes.SetBanList
    : T extends MessageType.SET_MUTE_LIST
    ? DataTypes.MessageTypes.SetMuteList
    : T extends MessageType.SET_CLOSE_PEER_CONNECTION
    ? DataTypes.MessageTypes.SetClosePeerConnection
    : T extends MessageType.SET_LOCALE
    ? DataTypes.MessageTypes.SetLocale
    : T extends MessageType.SET_RECORDING
    ? DataTypes.MessageTypes.SetRecording
    : T extends MessageType.SET_ERROR
    ? DataTypes.MessageTypes.SetError
    : never;
}

export type ArgsSubset<T> = DataTypes.ArgsSubset<T>;

export namespace Signaling {
  // eslint-disable-next-line @typescript-eslint/no-shadow
  export interface SendMessageArgs<T> {
    type: T;
    id: number | string;
    data: DataTypes.ArgsSubset<T>;
    connId: DataTypes.MessageTypes.ConnectionId<string>;
  }
  export abstract class WSInterface {
    public abstract connection: any;

    public readonly delimiter = '_';

    public abstract createConnection(args: any): any;

    public abstract parseMessage(text: string): SendMessageArgs<any> | null;

    public abstract getMessage<T extends keyof typeof MessageType>(
      type: T,
      message: SendMessageArgs<any>
    ): SendMessageArgs<T>;

    public abstract sendMessage: <T extends keyof typeof MessageType>(
      args: SendMessageArgs<T>,
      second?: boolean,
      cb?: () => void
    ) => Promise<1 | 0>;
  }
}

export namespace Connection {
  export type AddTracksProps = {
    roomId: number | string;
    connId: string;
    userId: number | string;
    target: number | string;
    locale?: LocaleServer['client'];
  };
  export abstract class RTCInterface {
    public abstract peerConnections: Record<string, RTCPeerConnection | undefined>;

    public abstract peerConnectionsServer: Record<
      string,
      Record<string, werift.RTCPeerConnection | undefined>
    >;

    public readonly delimiter = '_';

    public abstract createRTC(args: {
      connId: string;
      roomId: number | string;
      userId: number | string;
      target: string | number;
      iceServers?: RTCConfiguration['iceServers'];
    }): Record<number, RTCPeerConnection | undefined>;

    public abstract createRTCServer(args: {
      connId: string;
      roomId: number | string;
      userId: number | string;
      target: string | number;
      mimeType: string;
      iceServers?: RTCConfiguration['iceServers'];
    }): void;

    public abstract handleIceCandidate(args: {
      connId: string;
      roomId: number | string;
      userId: number | string;
      target: string | number;
    }): any;

    public abstract getPeerId(...args: (number | string)[]): string;

    public abstract closeVideoCall(args: {
      connId: string;
      roomId: number | string;
      userId: number | string;
      target: string | number;
    }): void;

    public abstract onClosedCall(args: {
      connId: string;
      roomId: number | string;
      userId: number | string;
      target: string | number;
    }): void;

    public abstract handleOfferMessage(msg: Signaling.SendMessageArgs<MessageType.OFFER>): void;

    public abstract handleCandidateMessage(
      msg: Signaling.SendMessageArgs<MessageType.CANDIDATE>,
      cb?: (cand: RTCIceCandidate | null) => any
    ): void;

    public abstract handleVideoAnswerMsg(
      msg: Signaling.SendMessageArgs<MessageType.ANSWER>,
      cb?: (res: 1 | 0) => any
    ): void;

    public abstract addTracks(
      args: AddTracksProps,
      cb: (e: 1 | 0, stream: MediaStream) => void
    ): void;
  }
}

export namespace Data {
  export abstract class DBInterface {
    public abstract roomCreate<T extends Prisma.RoomCreateArgs>(
      args: Prisma.SelectSubset<T, Prisma.RoomCreateArgs>,
      _connection?: WebSocket
    ): Promise<Prisma.CheckSelect<T, Room, Prisma.RoomGetPayload<T>> | null>;

    public abstract roomFindFirst<T extends Prisma.RoomFindFirstArgs>(
      args: Prisma.SelectSubset<T, Prisma.RoomFindFirstArgs>,
      _connection?: WebSocket
    ): Promise<Prisma.CheckSelect<T, Room, Prisma.RoomGetPayload<T>> | null>;

    public abstract roomUpdate<T extends Prisma.RoomUpdateArgs>(
      args: Prisma.SelectSubset<T, Prisma.RoomUpdateArgs>,
      _connection?: WebSocket
    ): Promise<Prisma.CheckSelect<T, Room, Prisma.RoomGetPayload<T>> | null>;

    public abstract unitUpdate<T extends Prisma.UnitUpdateArgs>(
      args: Prisma.SelectSubset<T, Prisma.UnitUpdateArgs>,
      _connection?: WebSocket
    ): Promise<Prisma.CheckSelect<T, Unit, Prisma.UnitGetPayload<T>> | null>;

    public abstract unitCreate<T extends Prisma.UnitCreateArgs>(
      args: Prisma.SelectSubset<T, Prisma.UnitCreateArgs>,
      _connection?: WebSocket
    ): Promise<Prisma.CheckSelect<T, Unit, Prisma.UnitGetPayload<T>> | null>;

    public abstract unitFindFirst<T extends Prisma.UnitFindFirstArgs>(
      args: Prisma.SelectSubset<T, Prisma.UnitFindFirstArgs>,
      _connection?: WebSocket
    ): Promise<Prisma.CheckSelect<T, Unit, Prisma.UnitGetPayload<T>> | null>;

    public abstract messageUpdate<T extends Prisma.MessageUpdateArgs>(
      args: Prisma.SelectSubset<T, Prisma.MessageUpdateArgs>,
      _connection?: WebSocket
    ): Promise<Prisma.CheckSelect<T, MessageFull, Prisma.MessageGetPayload<T>> | null>;

    public abstract messageCreate<T extends Prisma.MessageCreateArgs>(
      args: Prisma.SelectSubset<T, Prisma.MessageCreateArgs>,
      _connection?: WebSocket
    ): Promise<Prisma.CheckSelect<T, MessageFull, Prisma.MessageGetPayload<T>> | null>;

    public abstract messageDelete<T extends Prisma.MessageDeleteArgs>(
      args: Prisma.SelectSubset<T, Prisma.MessageDeleteArgs>,
      _connection?: WebSocket
    ): Promise<Prisma.CheckSelect<T, MessageFull, Prisma.MessageGetPayload<T>> | null>;

    public abstract messageFindMany<T extends Prisma.MessageFindManyArgs>(
      args: Prisma.SelectSubset<T, Prisma.MessageFindManyArgs>,
      _connection?: WebSocket
    ): Promise<Prisma.CheckSelect<
      T,
      GetManyResult<MessageFull>,
      Prisma.MessageGetPayload<T>
    > | null>;

    public abstract videoFindFirst<T extends Prisma.VideoFindFirstArgs>(
      args: Prisma.SelectSubset<T, Prisma.VideoFindFirstArgs>
    ): Promise<Prisma.CheckSelect<T, Video, Prisma.VideoGetPayload<T>> | null>;

    public abstract videoUpdate<T extends Prisma.VideoUpdateArgs>(
      args: Prisma.SelectSubset<T, Prisma.VideoUpdateArgs>
    ): Promise<Prisma.CheckSelect<T, Video, Prisma.VideoGetPayload<T>> | null>;

    public abstract videoCreate<T extends Prisma.VideoCreateArgs>(
      args: Prisma.SelectSubset<T, Prisma.VideoCreateArgs>
    ): Promise<Prisma.CheckSelect<T, Video, Prisma.VideoGetPayload<T>> | null>;

    public abstract videoDelete<T extends Prisma.VideoDeleteArgs>(
      args: Prisma.SelectSubset<T, Prisma.VideoDeleteArgs>
    ): Promise<Prisma.CheckSelect<T, Video, Prisma.VideoGetPayload<T>> | null>;

    public abstract videoFindMany<T extends Prisma.VideoFindManyArgs>(
      args: Prisma.SelectSubset<T, Prisma.VideoFindManyArgs>
    ): Promise<Prisma.CheckSelect<T, GetManyResult<Video>, Prisma.VideoGetPayload<T>> | null>;
  }
}

export namespace Handlers {
  export type Awaited<T> = T extends PromiseLike<infer U> ? U : T;
}

export type SendMessageArgs<T> = Signaling.SendMessageArgs<T>;
export type WSInterface = Signaling.WSInterface;
export type RTCInterface = Connection.RTCInterface;
export type DBInterface = Data.DBInterface;
export type AddTracksProps = Connection.AddTracksProps;
