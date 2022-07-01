/******************************************************************************************
 * Repository: https://github.com/kolserdav/uyem.git
 * File name: rtc.ts
 * Author: Sergey Kolmiller
 * Email: <uyem.ru@gmail.com>
 * License: BSD-2-Clause
 * License text: Binary distributions of this software include 'wrtc' and other third-party libraries.
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Tue Jun 21 2022 08:49:55 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/
import { RTCInterface } from '../types/interfaces';
import WS from './ws';
declare class RTC implements RTCInterface {
    peerConnections: RTCInterface['peerConnections'];
    readonly delimiter = "_";
    localTrackSettings: MediaTrackSettings | null;
    private ws;
    localStream: MediaStream | null;
    roomId: number | null;
    constructor({ ws }: {
        ws: WS;
    });
    createPeerConnection({ roomId, userId, target, connId, onTrack, }: {
        roomId: string | number;
        userId: string | number;
        target: string | number;
        connId: string;
        onTrack: (args: {
            addedUserId: string | number;
            stream: MediaStream;
            connId: string;
        }) => void;
    }, cb: (e: 0 | 1) => void): void;
    createRTC: RTCInterface['createRTC'];
    getPeerId(roomId: number | string, target: number | string, connId: string): string;
    handleIceCandidate: RTCInterface['handleIceCandidate'];
    invite({ roomId, userId, target, connId, }: {
        roomId: number | string;
        userId: number | string;
        target: number | string;
        connId: string;
    }): void;
    setMedia({ roomId, userId, target, connId, }: {
        roomId: number | string;
        userId: number | string;
        target: number | string;
        connId: string;
    }, cb: (e: 1 | 0) => void): void;
    onAddTrack: Record<string, (target: number | string, stream: MediaStream) => void>;
    /**
     * handleNewICECandidateMsg
     */
    handleCandidateMessage: RTCInterface['handleCandidateMessage'];
    handleOfferMessage: RTCInterface['handleOfferMessage'];
    handleVideoAnswerMsg: RTCInterface['handleVideoAnswerMsg'];
    closeVideoCall: RTCInterface['closeVideoCall'];
    closeByPeer: (peerId: string) => void;
    private getRoom;
    onClosedCall: RTCInterface['onClosedCall'];
    closeAllConnections(): void;
    parsePeerId({ target }: {
        target: string | number;
    }): string[];
}
export default RTC;
