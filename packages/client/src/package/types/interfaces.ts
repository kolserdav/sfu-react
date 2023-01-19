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
import path from 'path-browserify';
import { Message, Prisma, Room, Unit, Video, Quote, Admins } from '@prisma/client';

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
    id: string;
    name: string;
  };
  Quote: {
    MessageQuote:
      | (Message & {
          Unit: {
            id: string;
            name: string;
          };
        })
      | null;
  } | null;
};
export type QuoteFull = Quote;
export enum ErrorCode {
  initial = 'initial',
  roomIsInactive = 'roomIsInactive',
  errorSendMessage = 'errorSendMessage',
  youAreBanned = 'youAreBanned',
  videoRecordStop = 'videoRecordStop',
  forbidden = 'forbidden',
  notAuthorised = 'notAuthorised',
  duplicateTab = 'duplicateTab',
  errorDeleteMessage = 'errorDeleteMessage',
  errorSetAdmin = 'errorSetAdmin',
  errorToBan = 'errorToBan',
  errorToMute = 'errorToMute',
  errorToOffCamera = 'errorToOffCamera',
  badRequest = 'badRequest',
  notFound = 'notFound',
  serverError = 'serverError',
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
  GET_SETTINGS_UNIT = 'GET_SETTINGS_UNIT',
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
  SET_SETTINGS_UNIT = 'SET_SETTINGS_UNIT',
  GET_CHAT_MESSAGES = 'GET_CHAT_MESSAGES',
  SET_CHAT_MESSAGES = 'SET_CHAT_MESSAGES',
  GET_EDIT_MESSAGE = 'GET_EDIT_MESSAGE',
  SET_EDIT_MESSAGE = 'SET_EDIT_MESSAGE',
  GET_CREATE_MESSAGE = 'GET_CREATE_MESSAGE',
  SET_CREATE_MESSAGE = 'SET_CREATE_MESSAGE',
  GET_CREATE_QUOTE = 'GET_CREATE_QUOTE',
  SET_CREATE_QUOTE = 'SET_CREATE_QUOTE',
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
  GET_VIDEO_FIND_MANY = 'GET_VIDEO_FIND_MANY',
  SET_VIDEO_FIND_MANY = 'SET_VIDEO_FIND_MANY',
  GET_VIDEO_FIND_FIRST = 'GET_VIDEO_FIND_FIRST',
  SET_VIDEO_FIND_FIRST = 'SET_VIDEO_FIND_FIRST',
  GET_ASK_FLOOR = 'GET_ASK_FLOOR',
  SET_ASK_FLOOR = 'SET_ASK_FLOOR',
  GET_MUTE_FOR_ALL = 'GET_MUTE_FOR_ALL',
  SET_MUTE_FOR_ALL = 'SET_MUTE_FOR_ALL',
  GET_BLOCK_CHAT = 'GET_BLOCK_CHAT',
  SET_BLOCK_CHAT = 'SET_BLOCK_CHAT',
  GET_VIDEO_TRACK = 'GET_VIDEO_TRACK',
  SET_VIDEO_TRACK = 'SET_VIDEO_TRACK',
  GET_TO_ADMIN = 'GET_TO_ADMIN',
  SET_TO_ADMIN = 'SET_TO_ADMIN',
  GET_VIDEO_SETTINGS = 'GET_VIDEO_SETTINGS',
  SET_CREATE_VIDEO = 'SET_CREATE_VIDEO',
  GET_VIDEO_DELETE = 'GET_VIDEO_DELETE',
  SET_VIDEO_DELETE = 'SET_VIDEO_DELETE',
  GET_VIDEO_UPDATE = 'GET_VIDEO_UPDATE',
  SET_VIDEO_UPDATE = 'SET_VIDEO_UPDATE',
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
    forbidden: string;
    notAuthorised: string;
    duplicateTab: string;
    connected: string;
    ownerCanNotBeDeleted: string;
    ownerCanNotBeBanned: string;
    badRequest: string;
    notFound: string;
    serverError: string;
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
    willBeReconnect: string;
    guests: string;
    micOn: string;
    micOff: string;
    cameraOn: string;
    cameraOff: string;
    copyRoomLink: string;
    editMessage: string;
    messageDeleted: string;
    askForTheFloor: string;
    requestedTheFloor: string;
    shortAdmin: string;
    muteAll: string;
    muteForNew: string;
    blockChat: string;
    unblockChat: string;
    chatBlocked: string;
    numberOfGuests: string;
    noActiveVideoStreams: string;
    videoDeviceRequired: string;
    audioDeviceRequired: string;
    setAsAdmin: string;
    deleteFromAdmins: string;
    inactivityDisconnect: string;
    needDeleteVideo: string;
    close: string;
    changeVideoName: string;
    save: string;
  }
}

export type Command = 'add' | 'delete';
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
    export type GetSettingsUnit = {
      userId: string | number;
      locale: LocaleValue;
    };
    export type GetVideoSettings = {
      width: number;
      height: number;
      userId: string | number;
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
    export type GetMuteForAll = {
      value: boolean;
    };
    export type SetChangeRoomUnit = {
      target: number | string;
      name: string;
      eventName: 'delete' | 'add' | 'added';
      roomLength: number;
      isOwner: boolean;
      muteds: (string | number)[];
      banneds: RoomUser[];
      asked: RoomList[any];
      adminMuteds: (string | number)[];
    };
    export type SetUserId = {
      name: string;
    };

    export type GetRoom = {
      userId: number | string;
      mimeType: string;
      isPublic: boolean;
    };
    export type GetToMute = {
      target: string | number;
    };
    export type GetToBan = {
      target: string | number;
      userId: string | number;
    };
    export type GetAskFloor = {
      userId: string | number;
      command: Command;
    };
    export type GetVideoTrack = {
      target: string | number;
      userId: string | number;
      command: Command;
    };
    export type GetVideoFindMany = {
      userId: string | number;
      token: string;
      args: Prisma.VideoFindManyArgs;
    };
    export type GetToAdmin = {
      target: string | number;
      userId: string | number;
      command: Command;
    };
    export type GetVideoFindFirst = {
      userId: string | number;
      token: string;
      args: Prisma.VideoFindFirstArgs;
    };
    export type GetVideoUpdate = {
      userId: string | number;
      token: string;
      args: Prisma.VideoUpdateArgs;
    };
    export type GetVideoDelete = {
      userId: string | number;
      token: string;
      args: Prisma.VideoDeleteArgs;
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
      banneds: RoomUser[];
      adminMuteds: (string | number)[];
      asked: (string | number)[];
    };
    export type GetChatMessages = {
      args: Prisma.MessageFindManyArgs;
      userId: string | number;
    };
    export type GetBlockChat = {
      command: Command;
      target: string | number;
    };
    export type GetEditMessage = {
      args: Prisma.MessageUpdateArgs;
      userId: string | number;
    };
    export type SetAskFloor = {
      roomId: string | number;
      userId: string | number;
      asked: (string | number)[];
    };
    export type GetCreateMessage = {
      args: Prisma.MessageCreateArgs;
      userId: string | number;
    };
    export type SetVideoTrack = {
      offVideo: (string | number)[];
      command: Command;
      target: string | number;
      userId: string | number;
    };
    export type GetCreateQuote = {
      args: Prisma.QuoteCreateArgs;
      userId: string | number;
    };
    export type GetRecord = {
      command: keyof typeof RecordCommand;
      userId: string | number;
      token: string;
    };
    export type GetDeleteMessage = {
      args: Prisma.MessageDeleteArgs;
      userId: string | number;
    };
    export type SetRoom = {
      isOwner: boolean;
      asked: (string | number)[];
    };
    export type SetCreateVideo = {
      procent: number;
    };
    export type SetVideoFindMany = {
      videos: GetManyResult<Video>;
    };
    export type SetMuteForAll = {
      value: boolean;
    };
    export type SetVideoFindFirst = {
      video: Video | null;
    };
    export type SetVideoUpdate = {
      video: Video | null;
    };
    export type SetVideoDelete = {
      video: Video | null;
    };
    export type SetToAdmin = {
      target: string | number;
      command: Command;
    };
    export type SetBanList = {
      banneds: Banneds[any];
    };
    export type SetBlockChat = {
      target: string | number;
      blocked: (string | number)[];
    };
    export type SetMuteList = {
      muteds: RoomList[any];
      adminMuteds: RoomList[any];
      askeds: RoomList[any];
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
    export type SetCreateMessage = MessageFull;
    export type SetCreateQuote = QuoteFull;
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
    export type SetSettingsUnit = undefined;
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
    : T extends MessageType.GET_SETTINGS_UNIT
    ? DataTypes.MessageTypes.GetSettingsUnit
    : T extends MessageType.GET_ROOM
    ? DataTypes.MessageTypes.GetRoom
    : T extends MessageType.GET_TO_MUTE
    ? DataTypes.MessageTypes.GetToMute
    : T extends MessageType.GET_TO_BAN
    ? DataTypes.MessageTypes.GetToBan
    : T extends MessageType.GET_TO_UNMUTE
    ? DataTypes.MessageTypes.GetToUnMute
    : T extends MessageType.GET_TO_ADMIN
    ? DataTypes.MessageTypes.GetToAdmin
    : T extends MessageType.GET_MUTE_FOR_ALL
    ? DataTypes.MessageTypes.GetMuteForAll
    : T extends MessageType.GET_TO_UNBAN
    ? DataTypes.MessageTypes.GetToUnBan
    : T extends MessageType.GET_BLOCK_CHAT
    ? DataTypes.MessageTypes.GetBlockChat
    : T extends MessageType.GET_ASK_FLOOR
    ? DataTypes.MessageTypes.GetAskFloor
    : T extends MessageType.GET_VIDEO_TRACK
    ? DataTypes.MessageTypes.GetVideoTrack
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
    : T extends MessageType.SET_ASK_FLOOR
    ? DataTypes.MessageTypes.SetAskFloor
    : T extends MessageType.SET_SETTINGS_UNIT
    ? DataTypes.MessageTypes.SetSettingsUnit
    : T extends MessageType.SET_BLOCK_CHAT
    ? DataTypes.MessageTypes.SetBlockChat
    : T extends MessageType.SET_CHAT_MESSAGES
    ? DataTypes.MessageTypes.SetChatMessages
    : T extends MessageType.GET_ROOM_MESSAGE
    ? DataTypes.MessageTypes.GetRoomMessage
    : T extends MessageType.GET_EDIT_MESSAGE
    ? DataTypes.MessageTypes.GetEditMessage
    : T extends MessageType.GET_CREATE_MESSAGE
    ? DataTypes.MessageTypes.GetCreateMessage
    : T extends MessageType.GET_CREATE_QUOTE
    ? DataTypes.MessageTypes.GetCreateQuote
    : T extends MessageType.SET_VIDEO_TRACK
    ? DataTypes.MessageTypes.SetVideoTrack
    : T extends MessageType.SET_EDIT_MESSAGE
    ? DataTypes.MessageTypes.SetEditMessage
    : T extends MessageType.SET_CREATE_MESSAGE
    ? DataTypes.MessageTypes.SetCreateMessage
    : T extends MessageType.SET_CREATE_QUOTE
    ? DataTypes.MessageTypes.SetCreateQuote
    : T extends MessageType.GET_VIDEO_FIND_MANY
    ? DataTypes.MessageTypes.GetVideoFindMany
    : T extends MessageType.GET_VIDEO_FIND_FIRST
    ? DataTypes.MessageTypes.GetVideoFindFirst
    : T extends MessageType.GET_VIDEO_DELETE
    ? DataTypes.MessageTypes.GetVideoDelete
    : T extends MessageType.GET_VIDEO_UPDATE
    ? DataTypes.MessageTypes.GetVideoUpdate
    : T extends MessageType.GET_VIDEO_SETTINGS
    ? DataTypes.MessageTypes.GetVideoSettings
    : T extends MessageType.SET_VIDEO_FIND_MANY
    ? DataTypes.MessageTypes.SetVideoFindMany
    : T extends MessageType.SET_VIDEO_FIND_FIRST
    ? DataTypes.MessageTypes.SetVideoFindFirst
    : T extends MessageType.SET_VIDEO_DELETE
    ? DataTypes.MessageTypes.SetVideoDelete
    : T extends MessageType.SET_VIDEO_UPDATE
    ? DataTypes.MessageTypes.SetVideoUpdate
    : T extends MessageType.GET_DELETE_MESSAGE
    ? DataTypes.MessageTypes.GetDeleteMessage
    : T extends MessageType.SET_DELETE_MESSAGE
    ? DataTypes.MessageTypes.SetDeleteMessage
    : T extends MessageType.SET_ROOM_MESSAGE
    ? DataTypes.MessageTypes.SetRoomMessage
    : T extends MessageType.SET_BAN_LIST
    ? DataTypes.MessageTypes.SetBanList
    : T extends MessageType.SET_MUTE_FOR_ALL
    ? DataTypes.MessageTypes.SetMuteForAll
    : T extends MessageType.SET_MUTE_LIST
    ? DataTypes.MessageTypes.SetMuteList
    : T extends MessageType.SET_TO_ADMIN
    ? DataTypes.MessageTypes.SetToAdmin
    : T extends MessageType.SET_CLOSE_PEER_CONNECTION
    ? DataTypes.MessageTypes.SetClosePeerConnection
    : T extends MessageType.SET_LOCALE
    ? DataTypes.MessageTypes.SetLocale
    : T extends MessageType.SET_RECORDING
    ? DataTypes.MessageTypes.SetRecording
    : T extends MessageType.SET_CREATE_VIDEO
    ? DataTypes.MessageTypes.SetCreateVideo
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
    locale: LocaleServer['client'];
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
      icePortRange?: [number, number];
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
      eventName: string;
    }): void;

    public abstract onClosedCall(args: {
      connId: string;
      roomId: number | string;
      userId: number | string;
      target: string | number;
      command: keyof werift.RTCPeerConnection;
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
      args: Omit<AddTracksProps, 'locale' | 'userId'> & { stream: MediaStream },
      cb: (e: 1 | 0) => void
    ): void;

    public abstract addTracksServer(
      args: Omit<AddTracksProps, 'locale'>,
      cb: (e: 1 | 0) => void
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

    public abstract quoteCreate<T extends Prisma.QuoteCreateArgs>(
      args: Prisma.SelectSubset<T, Prisma.QuoteCreateArgs>,
      _connection?: WebSocket
    ): Promise<Prisma.CheckSelect<T, QuoteFull, Prisma.QuoteGetPayload<T>> | null>;

    public abstract messageDelete<T extends Prisma.MessageDeleteArgs>(
      args: Prisma.SelectSubset<T, Prisma.MessageDeleteArgs>,
      _connection?: WebSocket
    ): Promise<Prisma.CheckSelect<T, MessageFull, Prisma.MessageGetPayload<T>> | null>;

    public abstract messageFindMany<T extends Prisma.MessageFindManyArgs>(
      args: Prisma.SelectSubset<T, Prisma.MessageFindManyArgs>,
      _connection?: WebSocket
    ): Promise<Prisma.CheckSelect<T, GetManyResult<MessageFull>, Prisma.MessageGetPayload<T>>>;

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
    ): Promise<Prisma.CheckSelect<T, GetManyResult<Video>, Prisma.VideoGetPayload<T>>>;

    public abstract adminsFindFirst<T extends Prisma.AdminsFindFirstArgs>(
      args: Prisma.SelectSubset<T, Prisma.AdminsFindFirstArgs>
    ): Promise<Prisma.CheckSelect<T, Admins, Prisma.AdminsGetPayload<T>> | null>;

    public abstract adminsCreate<T extends Prisma.AdminsCreateArgs>(
      args: Prisma.SelectSubset<T, Prisma.AdminsCreateArgs>
    ): Promise<Prisma.CheckSelect<T, Admins, Prisma.AdminsGetPayload<T>> | null>;

    public abstract adminsUpdate<T extends Prisma.AdminsUpdateArgs>(
      args: Prisma.SelectSubset<T, Prisma.AdminsUpdateArgs>
    ): Promise<Prisma.CheckSelect<T, Admins, Prisma.AdminsGetPayload<T>> | null>;

    public abstract adminsDelete<T extends Prisma.AdminsDeleteArgs>(
      args: Prisma.SelectSubset<T, Prisma.AdminsDeleteArgs>
    ): Promise<Prisma.CheckSelect<T, Admins, Prisma.AdminsGetPayload<T>> | null>;
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

export const DELIMITER = '_';
export const TEMPORARY_PATH = 'tmp';
export const RECORD_VIDEOS_PATH = 'videos';
export const VIDEO_BACKGROUNDS_PATH = 'backgrounds';
export const EXT_WEBM = '.webm';
export const TOKEN_QUERY_NAME = 'token';

export interface Chunk {
  index: number;
  id: string;
  start: number;
  end: number;
  width: number;
  height: number;
  video: boolean;
  audio: boolean;
  fullPath: string;
  map: string;
  mapA: string;
}

export interface Episode {
  start: number;
  end: number;
  map: string;
  mapA: string;
  video: boolean;
  audio: boolean;
  chunks: Chunk[];
}

export const createVideoChunks = ({
  dir,
  dirPath,
  indexShift,
}: {
  dir: string[];
  dirPath: string;
  indexShift?: boolean;
}): Chunk[] => {
  const chunks: Omit<Chunk, 'index'>[] = [];
  dir.forEach((item) => {
    const peer = item.replace(EXT_WEBM, '').split(DELIMITER);
    const start = parseFloat(peer[0]);
    const end = parseFloat(peer[1]);
    const id = peer[2];
    const video = peer[3] === '1';
    const audio = peer[4] === '1';
    chunks.push({
      id,
      start,
      end,
      video,
      audio,
      width: parseInt(peer[5], 10),
      height: parseInt(peer[6], 10),
      fullPath: path.resolve(dirPath, item),
      map: '',
      mapA: '',
    });
  });
  return chunks
    .sort((a, b) => {
      if (a.start < b.start) {
        return -1;
      }
      if (a.start === b.start) {
        if (a.end < b.end) {
          return -1;
        }
      }
      return 1;
    })
    .map((item, index) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const _item: Chunk = { ...item } as any;
      _item.index = index + (indexShift ? 1 : 0);
      return _item;
    });
};
