/******************************************************************************************
 * Repository: https://github.com/kolserdav/uyem.git
 * File name: interfaces.ts
 * Author: Sergey Kolmiller
 * Email: <uyem.ru@gmail.com>
 * License: BSD-2-Clause
 * License text: Binary distributions of this software include 'wrtc' and other third-party libraries.
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Tue Jun 21 2022 08:50:18 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/
export declare type SendMessageArgs<T> = Signaling.SendMessageArgs<T>;
export declare type WSInterface = Signaling.WSInterface;
export declare type RTCInterface = Connection.RTCInterface;
export declare enum MessageType {
    GET_USER_ID = "GET_USER_ID",
    SET_USER_ID = "SET_USER_ID",
    GET_LOGIN = "GET_LOGIN",
    TOKEN = "TOKEN",
    OFFER = "OFFER",
    CANDIDATE = "CANDIDATE",
    ANSWER = "ANSWER",
    GET_ROOM = "GET_ROOM",
    SET_ROOM = "SET_ROOM",
    SET_ERROR = "SET_ERROR",
    GET_ROOM_GUESTS = "GET_ROOM_GUESTS",
    SET_ROOM_GUESTS = "SET_ROOM_GUESTS",
    SET_CHANGE_UNIT = "SET_CHANGE_UNIT",
    GET_MUTE = "GET_MUTE",
    SET_MUTE = "SET_MUTE"
}
export declare namespace DataTypes {
    namespace MessageTypes {
        type GetMute = {
            muted: boolean;
            roomId: string | number;
        };
        type GetRoomGuests = {
            roomId: number | string;
        };
        type GetGuestId = {
            isRoom?: boolean;
        };
        type SetChangeRoomUnit = {
            target: number | string;
            eventName: 'delete' | 'add' | 'added';
            roomLenght: number;
            muteds: string[];
        };
        type SetGuestId = undefined;
        type GetRoom = {
            userId: number | string;
        };
        type SetRoomGuests = {
            roomUsers: (number | string)[];
            muteds: string[];
        };
        type SetRoom = undefined;
        type SetError = {
            message: string;
            context: SendMessageArgs<any>;
        };
        type SetMute = {
            muteds: string[];
        };
        type Offer = {
            sdp: RTCSessionDescriptionInit;
            userId: number | string;
            target: number | string;
        };
        type Candidate = {
            candidate: RTCIceCandidate;
            userId: number | string;
            target: number | string;
        };
        type Answer = {
            sdp: RTCSessionDescriptionInit;
            userId: number | string;
            target: number | string;
        };
        type ConnectionId<T> = T extends infer R ? R : never;
    }
    type ArgsSubset<T> = T extends MessageType.OFFER ? DataTypes.MessageTypes.Offer : T extends MessageType.ANSWER ? DataTypes.MessageTypes.Answer : T extends MessageType.CANDIDATE ? DataTypes.MessageTypes.Candidate : T extends MessageType.GET_MUTE ? DataTypes.MessageTypes.GetMute : T extends MessageType.GET_USER_ID ? DataTypes.MessageTypes.GetGuestId : T extends MessageType.SET_USER_ID ? DataTypes.MessageTypes.SetGuestId : T extends MessageType.GET_ROOM ? DataTypes.MessageTypes.GetRoom : T extends MessageType.SET_ROOM ? DataTypes.MessageTypes.SetRoom : T extends MessageType.GET_ROOM_GUESTS ? DataTypes.MessageTypes.GetRoomGuests : T extends MessageType.SET_ROOM_GUESTS ? DataTypes.MessageTypes.SetRoomGuests : T extends MessageType.SET_CHANGE_UNIT ? DataTypes.MessageTypes.SetChangeRoomUnit : T extends MessageType.SET_MUTE ? DataTypes.MessageTypes.SetMute : T extends MessageType.SET_ERROR ? DataTypes.MessageTypes.SetError : unknown;
}
export declare namespace Signaling {
    interface SendMessageArgs<T> {
        type: T;
        id: number | string;
        data: DataTypes.ArgsSubset<T>;
        connId: DataTypes.MessageTypes.ConnectionId<string>;
    }
    abstract class WSInterface {
        abstract connection: any;
        abstract createConnection(args: any): any;
        abstract parseMessage(text: string): SendMessageArgs<any> | null;
        abstract getMessage<T extends keyof typeof MessageType>(type: T, message: SendMessageArgs<any>): SendMessageArgs<T>;
        abstract sendMessage: <T extends keyof typeof MessageType>(args: SendMessageArgs<T>) => Promise<1 | 0>;
    }
}
export declare namespace Connection {
    abstract class RTCInterface {
        abstract peerConnections: Record<string, RTCPeerConnection | undefined>;
        readonly delimiter = "_";
        abstract createRTC(args: {
            connId: string;
            roomId: number | string;
            userId: number | string;
            target: string | number;
        }): Record<number, RTCPeerConnection | undefined>;
        abstract handleIceCandidate({ connId, roomId, userId, target, }: {
            connId: string;
            roomId: number | string;
            userId: number | string;
            target: string | number;
        }): any;
        abstract getPeerId(...args: (number | string)[]): string;
        abstract closeVideoCall({ connId, roomId, userId, target, }: {
            connId: string;
            roomId: number | string;
            userId: number | string;
            target: string | number;
        }): void;
        abstract onClosedCall({ connId, roomId, userId, target, }: {
            connId: string;
            roomId: number | string;
            userId: number | string;
            target: string | number;
        }): void;
        abstract handleOfferMessage(msg: Signaling.SendMessageArgs<MessageType.OFFER>, cb?: (desc: RTCSessionDescription | null) => any): void;
        abstract handleCandidateMessage(msg: Signaling.SendMessageArgs<MessageType.CANDIDATE>, cb?: (cand: RTCIceCandidate | null) => any): void;
        abstract handleVideoAnswerMsg(msg: Signaling.SendMessageArgs<MessageType.ANSWER>, cb?: (res: 1 | 0) => any): void;
    }
}
export declare namespace Handlers {
    type Awaited<T> = T extends PromiseLike<infer U> ? U : T;
}
