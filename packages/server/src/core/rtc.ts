/******************************************************************************************
 * Repository: https://github.com/kolserdav/werift-sfu-react.git
 * File name: rtc.ts
 * Author: Sergey Kolmiller
 * Email: <uyem.ru@gmail.com>
 * License: MIT
 * License text: See in LICENSE file
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Wed Aug 24 2022 14:14:09 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/
// eslint-disable-next-line import/no-relative-packages
//import * as werift from '../werift-webrtc/packages/webrtc/lib/webrtc/src/index';
import * as werift from 'werift';
import {
  RTCInterface,
  MessageType,
  SendMessageArgs,
  RoomUser,
  ErrorCode,
  RoomList,
} from '../types/interfaces';
import { checkSignallingState, getLocale, log } from '../utils/lib';
import { STUN_SERVER, SENT_RTCP_INTERVAL } from '../utils/constants';
import WS from './ws';
import DB from './db';

const db = new DB();

// eslint-disable-next-line no-unused-vars
export type OnRoomConnect = (args: {
  roomId: string | number;
  userId: string | number;
  roomUsers: RoomUser[];
}) => void;

// eslint-disable-next-line no-unused-vars
export type OnRoomOpen = (args: { roomId: string | number; ownerId: string | number }) => void;

class RTC implements Omit<RTCInterface, 'peerConnections' | 'createRTC' | 'handleVideoAnswerMsg'> {
  public peerConnectionsServer: RTCInterface['peerConnectionsServer'] = {};

  public readonly delimiter = '_';

  public rooms: Record<string | number, RoomUser[]> = {};

  public ssrcIntervals: Record<string, NodeJS.Timer> = {};

  public muteds: RoomList = {};

  public adminMuteds: RoomList = {};

  public banneds: Record<string, RoomUser[]> = {};

  private ws: WS;

  public streams: Record<string, Record<string, werift.MediaStreamTrack[]>> = {};

  constructor({ ws }: { ws: WS }) {
    this.ws = ws;
  }

  public getPeerId(
    id: number | string,
    userId: number | string,
    target: number | string,
    connId: string
  ) {
    return `${id}${this.delimiter}${userId}${this.delimiter}${target || 0}${
      this.delimiter
    }${connId}`;
  }

  public closePeerConnectionHandler({
    id,
    data: { target, roomId },
    connId,
  }: SendMessageArgs<MessageType.GET_CLOSE_PEER_CONNECTION>) {
    this.closeVideoCall({ roomId, userId: id, target, connId });
    this.ws.sendMessage({
      type: MessageType.SET_CLOSE_PEER_CONNECTION,
      id,
      data: {
        target,
        roomId,
      },
      connId,
    });
  }

  public createRTCServer: RTCInterface['createRTCServer'] = (opts) => {
    const { roomId, userId, target, connId, mimeType } = opts;
    const peerId = this.getPeerId(roomId, userId, target, connId);
    if (!this.peerConnectionsServer[roomId]) {
      this.peerConnectionsServer[roomId] = {};
    }
    if (this.peerConnectionsServer[roomId][peerId]) {
      log('info', 'Duplicate peer connection', opts);
      this.closeVideoCall({ roomId, userId, target, connId });
    } else {
      log('log', 'Creating peer connection', opts);
    }
    this.peerConnectionsServer[roomId][peerId] = new werift.RTCPeerConnection({
      codecs: {
        audio: [
          new werift.RTCRtpCodecParameters({
            mimeType: 'audio/opus',
            clockRate: 48000,
            channels: 2,
          }),
        ],
        video: [
          new werift.RTCRtpCodecParameters({
            mimeType,
            clockRate: 90000,
            rtcpFeedback: [
              { type: 'ccm', parameter: 'fir' },
              { type: 'nack' },
              { type: 'nack', parameter: 'pli' },
              { type: 'goog-remb' },
            ],
          }),
        ],
      },
      iceTransportPolicy: 'all',
      bundlePolicy: 'disable',
      iceServers: [
        {
          urls: STUN_SERVER,
        },
      ],
    });
  };

  public getRevPeerId(peerId: string) {
    const peer = peerId.split(this.delimiter);
    return {
      peerId: `${peer[0]}${this.delimiter}${peer[2]}${this.delimiter}${peer[1]}${this.delimiter}${peer[3]}`,
      userId: peer[2],
      target: peer[1],
      connId: peer[3],
      id: peer[0],
    };
  }

  public handleIceCandidate: RTCInterface['handleIceCandidate'] = ({
    roomId,
    userId,
    target,
    connId,
  }) => {
    const peerId = this.getPeerId(roomId, userId, target, connId);
    if (!this.peerConnectionsServer[roomId]?.[peerId]) {
      log('warn', 'Handle ice candidate without peerConnection', { peerId });
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const core = this;
    const { ws, delimiter, rooms } = this;
    const { addTracks, peerConnectionsServer } = this;
    this.peerConnectionsServer[roomId][peerId]!.onsignalingstatechange =
      function handleSignalingStateChangeEvent() {
        if (!core.peerConnectionsServer[roomId][peerId]) {
          log('warn', 'On signalling state change without peer connection', { peerId });
          return;
        }
        const state = peerConnectionsServer[roomId][peerId].signalingState;
        log('log', 'On connection state change', { peerId, state, target });
        // Add tracks from remote offer
        if (state === 'have-remote-offer' && target.toString() !== '0') {
          addTracks({ roomId, userId, target, connId }, () => {
            //
          });
        }
        log(
          'info',
          '! WebRTC signaling state changed to:',
          core.peerConnectionsServer[roomId][peerId]!.signalingState
        );
        switch (core.peerConnectionsServer[roomId][peerId]!.signalingState) {
          case 'closed':
            core.onClosedCall({ roomId, userId, target, connId });
            break;
          default:
        }
      };
    this.peerConnectionsServer[roomId][peerId]!.onRemoteTransceiverAdded.subscribe(
      async (transceiver) => {
        if (target.toString() === '0') {
          const [track] = await transceiver.onTrack.asPromise();
          this.ssrcIntervals[peerId] = setInterval(() => {
            transceiver.receiver.sendRtcpPLI(track.ssrc);
          }, SENT_RTCP_INTERVAL);
        }
      }
    );
    const isChanged = false;
    this.peerConnectionsServer[roomId][peerId]!.ontrack = (e) => {
      const peer = peerId.split(delimiter);
      const isRoom = peer[2] === '0';
      const stream = e.streams[0];
      if (!this.streams[roomId]) {
        this.streams[roomId] = {};
      }
      const isNew = !this.streams[roomId][peerId]?.length;
      log('info', 'ontrack', {
        peerId,
        isRoom,
        si: stream.id,
        isNew,
        userId,
        target,
        tracks: stream.getTracks().map((item) => item.kind),
      });
      if (isRoom) {
        if (!this.streams[roomId][peerId]) {
          this.streams[roomId][peerId] = [];
        }
        this.streams[roomId][peerId].push(stream.getTracks()[0]);
        const room = rooms[roomId];
        if (room && isNew && !isChanged) {
          setTimeout(() => {
            room.forEach((item) => {
              ws.sendMessage({
                type: MessageType.SET_CHANGE_UNIT,
                id: item.id,
                data: {
                  target: userId,
                  name: item.name,
                  eventName: 'add',
                  roomLength: rooms[roomId]?.length || 0,
                  muteds: this.muteds[roomId],
                  adminMuteds: this.adminMuteds[roomId],
                  isOwner: this.rooms[roomId]?.find((_item) => _item.id === userId).isOwner,
                },
                connId,
              });
            });
          }, 0);
        } else if (!room) {
          log('warn', 'Room missing in memory', { roomId });
        }
      }
    };
  };

  public handleCandidateMessage: RTCInterface['handleCandidateMessage'] = async (msg, cb) => {
    const {
      id,
      connId,
      data: { candidate, userId, target, roomId },
    } = msg;
    const peerId = this.getPeerId(id, userId, target, connId);
    const cand = new werift.RTCIceCandidate(candidate as werift.RTCIceCandidate);
    log('log', 'Trying to add ice candidate:', {
      peerId,
      connId,
      id,
      userId,
      target,
    });
    if (!this.peerConnectionsServer[roomId]?.[peerId]) {
      log('warn', 'Skiping add ice candidate', {
        connId,
        id,
        userId,
        peerId,
        target,
        state: this.peerConnectionsServer[roomId][peerId]?.connectionState,
        ice: this.peerConnectionsServer[roomId][peerId]?.iceConnectionState,
        ss: this.peerConnectionsServer[roomId][peerId]?.signalingState,
      });
      return;
    }
    this.peerConnectionsServer[roomId][peerId]!.addIceCandidate(cand)
      .then(() => {
        log('log', '!! Adding received ICE candidate:', { userId, id, target });
        if (cb) {
          cb(cand as RTCIceCandidate);
        }
      })
      .catch((e) => {
        log('error', 'Set ice candidate error', {
          error: e,
          connId,
          id,
          userId,
          target,
          state: this.peerConnectionsServer[roomId][peerId]?.connectionState,
          ice: this.peerConnectionsServer[roomId][peerId]?.iceConnectionState,
          ss: this.peerConnectionsServer[roomId][peerId]?.signalingState,
        });
        if (cb) {
          cb(null);
        }
      });
  };

  public handleOfferMessage: RTCInterface['handleOfferMessage'] = async (msg) => {
    const {
      id,
      connId,
      data: { sdp, userId, target, mimeType, roomId },
    } = msg;
    if (!sdp) {
      log('warn', 'Message offer error because sdp is:', sdp);
      return;
    }
    const peerId = this.getPeerId(id, userId, target, connId);
    this.createRTCServer({
      roomId: id,
      userId,
      target,
      connId,
      mimeType,
    });
    const opts = {
      roomId: id,
      userId,
      target,
      connId,
      is: this.peerConnectionsServer[roomId][peerId]?.iceConnectionState,
      cs: this.peerConnectionsServer[roomId][peerId]?.connectionState,
      ss: this.peerConnectionsServer[roomId][peerId]?.signalingState,
    };
    log('info', '--> Creating answer', opts);
    if (!this.peerConnectionsServer[roomId]?.[peerId]) {
      log('warn', 'Handle offer message without peer connection', opts);
      return;
    }
    this.handleIceCandidate({
      roomId: id,
      userId,
      target,
      connId,
    });
    const desc = new werift.RTCSessionDescription(sdp.sdp as string, 'offer');
    let error = false;
    await this.peerConnectionsServer[roomId][peerId]!.setRemoteDescription(desc).catch((e) => {
      log('error', 'Error set remote description', { e: e.message, stack: e.stack, ...opts });
      error = true;
    });
    if (!this.peerConnectionsServer[roomId]?.[peerId]) {
      log('warn', 'Create answer without peer connection', opts);
      return;
    }
    const { signalingState } = this.peerConnectionsServer[roomId][peerId];
    if (!checkSignallingState(signalingState)) {
      log('info', 'Skiping create answer', { signalingState, peerId, roomId });
      return;
    }
    const answ = await this.peerConnectionsServer[roomId][peerId]!.createAnswer().catch((e) => {
      log('error', 'Error create answer', {
        e: e.message,
        stack: e.stack,
        ...opts,
      });
      error = true;
    });
    if (!answ) {
      error = true;
      return;
    }
    log('info', '---> Setting local description after creating answer', { ...opts });
    if (!this.peerConnectionsServer[roomId]?.[peerId] || error) {
      log('warn', 'Failed set local description fo answer', {
        error,
        ...opts,
      });
      return;
    }
    await this.peerConnectionsServer[roomId][peerId]!.setLocalDescription(answ).catch((err) => {
      log('error', 'Error set local description for answer', {
        message: err.message,
        stack: err.stack,
        ...opts,
      });
      error = true;
    });
    const { localDescription } = this.peerConnectionsServer[roomId][peerId]!;
    if (localDescription) {
      log('info', 'Sending answer packet back to other peer', opts);
      this.ws.sendMessage({
        id: userId,
        type: MessageType.ANSWER,
        data: {
          sdp: localDescription,
          userId: id,
          target,
        },
        connId,
      });
    } else {
      log('warn', 'Failed send answer because localDescription is', localDescription);
    }
  };

  private getStreamConnId(roomId: string | number, userId: string | number) {
    let _connId = '';
    const keys = this.getKeysStreams(roomId);
    keys.forEach((element) => {
      const str = element.split(this.delimiter);
      const isTarget = str[1] === userId.toString() && str[2] === '0';
      if (isTarget) {
        // eslint-disable-next-line prefer-destructuring
        _connId = str[3];
      }
    });
    return _connId;
  }

  private getPeerConnId(roomId: string | number, userId: string | number, target: number | string) {
    let _connId = '';
    const keys = this.getPeerConnectionKeys(roomId);
    keys.forEach((element) => {
      const str = element.split(this.delimiter);
      const isTarget = str[1] === userId.toString() && str[2] === target.toString();
      if (isTarget) {
        // eslint-disable-next-line prefer-destructuring
        _connId = str[3];
      }
    });
    return _connId;
  }

  private getKeysStreams(roomId: string | number) {
    return Object.keys(this.streams[roomId]);
  }

  public addTracks: RTCInterface['addTracks'] = ({ roomId, connId, userId, target }) => {
    const _connId = this.getStreamConnId(roomId, target);
    const _connId1 = this.getPeerConnId(roomId, userId, target);
    const peerId = this.getPeerId(roomId, userId, target, _connId1);
    const _peerId = this.getPeerId(roomId, target, 0, _connId);
    const tracks = this.streams[roomId][_peerId];
    const streams = this.getKeysStreams(roomId);
    const opts = {
      roomId,
      userId,
      target,
      connId,
      _peerId,
      peerId,
      tracksL: tracks?.length,
      tracks: tracks?.map((item) => item.kind),
      ssL: streams.length,
      ss: streams,
      cS: this.peerConnectionsServer[roomId][peerId]?.connectionState,
      sS: this.peerConnectionsServer[roomId][peerId]?.signalingState,
      iS: this.peerConnectionsServer[roomId][peerId]?.iceConnectionState,
    };
    if (!tracks || tracks?.length === 0) {
      log('warn', 'Skiping add track', { ...opts, tracks });
      return;
    }
    if (this.peerConnectionsServer[roomId][peerId]) {
      log('info', 'Add tracks', opts);
      tracks.forEach((track) => {
        this.peerConnectionsServer[roomId][peerId]!.addTrack(track);
      });
    } else {
      log('error', 'Can not add tracks', { opts });
    }
  };

  private cleanStream({
    roomId,
    peerId,
    target,
  }: {
    roomId: string | number;
    peerId: string;
    target: string | number;
  }) {
    if (this.streams[roomId]?.[peerId]) {
      delete this.streams[roomId][peerId];
    } else if (target.toString() === '0') {
      log('warn', 'Delete undefined stream', { peerId });
    }
  }

  public closeVideoCall: RTCInterface['closeVideoCall'] = ({ roomId, userId, target, connId }) => {
    const peerId = this.getPeerId(roomId, userId, target, connId);
    this.cleanStream({ roomId, peerId, target });
    if (!this.peerConnectionsServer[roomId]?.[peerId]) {
      log('warn', 'Close video call without peer connection', { peerId });
      return;
    }
    log('info', '| Closing the call', {
      peerId,
    });
    this.peerConnectionsServer[roomId][peerId]!.onsignalingstatechange = null;
    this.peerConnectionsServer[roomId][peerId]!.onnegotiationneeded = null;
    this.peerConnectionsServer[roomId][peerId]!.ontrack = null;
    this.peerConnectionsServer[roomId][peerId]!.close();
    delete this.peerConnectionsServer[roomId][peerId];
    if (target.toString() === '0') {
      clearInterval(this.ssrcIntervals[peerId]);
    }
  };

  // TODO check errors
  public async addUserToRoom({
    userId,
    roomId,
    onRoomOpen,
  }: {
    userId: number | string;
    roomId: number | string;
    onRoomOpen?: OnRoomOpen;
  }): Promise<{ error: 1 | 0; isOwner: boolean }> {
    const room = await db.roomFindFirst({
      where: {
        id: roomId.toString(),
      },
    });
    const locale = getLocale(this.ws.users[userId].locale).server;
    let isOwner = room?.authorId === userId.toString();
    if (!room) {
      const authorId = userId.toString();
      db.roomCreate({
        data: {
          id: roomId.toString(),
          authorId,
          Guests: {
            create: {
              unitId: authorId,
            },
          },
        },
      });
      isOwner = true;
    } else {
      if (room.archive) {
        if (!isOwner) {
          this.ws.sendMessage({
            type: MessageType.SET_ERROR,
            id: userId,
            connId: '',
            data: {
              message: locale.roomInactive,
              type: 'warn',
              code: ErrorCode.roomIsInactive,
            },
          });
          return {
            error: 1,
            isOwner,
          };
        }
        await db.roomUpdate({
          where: {
            id: room.id,
          },
          data: {
            archive: false,
            updated: new Date(),
          },
        });
      }
      this.ws.sendMessage({
        type: MessageType.SET_ERROR,
        id: userId,
        connId: '',
        data: {
          message: '',
          type: 'log',
          code: ErrorCode.initial,
        },
      });
      db.unitFindFirst({
        where: {
          id: userId.toString(),
        },
        select: {
          IGuest: {
            select: {
              id: true,
            },
          },
        },
      }).then((g) => {
        const id = roomId.toString();
        if (!g) {
          log('warn', 'Unit not found', { id: userId.toString() });
        } else if (!g?.IGuest[0]) {
          db.unitUpdate({
            where: {
              id: userId.toString(),
            },
            data: {
              IGuest: {
                create: {
                  roomId: id,
                },
              },
              updated: new Date(),
            },
          }).then((r) => {
            if (!r) {
              log('warn', 'Room not updated', { roomId });
            }
          });
        } else if (g.IGuest[0].id) {
          db.unitUpdate({
            where: {
              id: userId.toString(),
            },
            data: {
              IGuest: {
                update: {
                  where: {
                    id: g.IGuest[0].id,
                  },
                  data: {
                    updated: new Date(),
                  },
                },
              },
            },
          });
        } else {
          log('warn', 'Room not saved', { g: g.IGuest[0]?.id, id });
        }
      });
    }
    const { name } = this.ws.users[userId];
    if (!this.rooms[roomId]) {
      this.rooms[roomId] = [
        {
          id: userId,
          name,
          isOwner,
        },
      ];
      this.muteds[roomId] = [];
      this.adminMuteds[roomId] = [];
      this.banneds[roomId] = [];
    } else if (!this.rooms[roomId].find((item) => userId === item.id)) {
      this.rooms[roomId].push({
        id: userId,
        name,
        isOwner,
      });
    } else {
      log('info', 'Room exists and user added before.', { roomId, userId });
    }
    if (isOwner && onRoomOpen) {
      onRoomOpen({ roomId, ownerId: userId });
    }
    return { error: 0, isOwner };
  }

  public async handleGetRoomMessage({
    message,
    port,
    cors,
    onRoomConnect,
    onRoomOpen,
  }: {
    message: SendMessageArgs<MessageType.GET_ROOM>;
    port: number;
    cors: string;
    onRoomConnect?: OnRoomConnect;
    onRoomOpen?: OnRoomOpen;
  }) {
    log('log', 'Get room message', message);
    const {
      data: { userId: uid, mimeType },
      id,
      connId,
    } = message;
    if (!this.rooms[id]) {
      this.rooms[id] = [];
      this.muteds[id] = [];
      this.adminMuteds[id] = [];
      this.banneds[id] = [];
    }
    let index = -1;
    this.banneds[id].forEach((item, i) => {
      if (item.id === uid) {
        index = i;
      }
    });
    const locale = getLocale(this.ws.users[uid].locale).server;
    if (index !== -1) {
      this.ws.sendMessage({
        type: MessageType.SET_ERROR,
        id: uid,
        connId,
        data: {
          type: 'warn',
          code: ErrorCode.youAreBanned,
          message: locale.youAreBanned,
        },
      });
      return;
    }
    const { error, isOwner } = await this.addUserToRoom({
      roomId: id,
      userId: uid,
      onRoomOpen,
    });
    if (error) {
      this.ws.sendMessage({
        type: MessageType.SET_ROOM,
        id: uid,
        data: {
          isOwner,
        },
        connId,
      });
      log('warn', 'Can not add user to room', { id, uid });
      return;
    }
    const connection = new this.ws.WebSocket(`ws://localhost:${port}`, {
      headers: {
        origin: cors.split(',')[0],
      },
    });
    connection.onopen = () => {
      log('info', 'On open room', { roomId: id, userId: uid, target: 0, connId, mimeType });
      connection.send(
        JSON.stringify({
          type: MessageType.GET_USER_ID,
          id,
          data: {
            isRoom: true,
          },
          connId: '',
        })
      );
      connection.onmessage = (mess) => {
        const msg = this.ws.parseMessage(mess.data as string);
        if (msg) {
          const { type } = msg;
          switch (type) {
            case MessageType.OFFER:
              this.handleOfferMessage(msg);
              break;
            case MessageType.CANDIDATE:
              this.handleCandidateMessage(msg);
              break;
            default:
          }
        }
      };
    };
    if (onRoomConnect) {
      onRoomConnect({
        roomId: id,
        userId: uid,
        roomUsers: this.rooms[id],
      });
    }
    this.ws.sendMessage({
      type: MessageType.SET_ROOM,
      id: uid,
      data: {
        isOwner,
      },
      connId,
    });
    this.ws.sendMessage({
      type: MessageType.SET_MUTE_LIST,
      id: uid,
      data: {
        muteds: this.muteds[id],
        adminMuteds: this.adminMuteds[id],
      },
      connId,
    });
    if (isOwner) {
      this.ws.sendMessage({
        type: MessageType.SET_BAN_LIST,
        id: uid,
        data: {
          banneds: this.banneds[id],
        },
        connId,
      });
    }
  }

  // eslint-disable-next-line class-methods-use-this
  public onClosedCall: RTCInterface['onClosedCall'] = (args) => {
    log('warn', 'Call is closed', { ...args });
  };

  public getPeerConnectionKeys(roomId: string | number) {
    return Object.keys(this.peerConnectionsServer[roomId] || {});
  }

  public cleanConnections(roomId: string, userId: string) {
    const peerKeys = this.getPeerConnectionKeys(roomId);
    peerKeys.forEach((__item) => {
      const peer = __item.split(this.delimiter);
      if (peer[1] === userId.toString()) {
        this.closeVideoCall({
          roomId,
          userId,
          target: peer[2],
          connId: peer[3],
        });
      } else if (peer[2] === userId.toString()) {
        this.closeVideoCall({
          roomId,
          userId: peer[1],
          target: userId,
          connId: peer[3],
        });
      }
    });
  }

  public handleGetMute({ id, data: { muted, roomId } }: SendMessageArgs<MessageType.GET_MUTE>) {
    const index = this.muteds[roomId].indexOf(id);
    if (muted) {
      if (index === -1) {
        this.muteds[roomId].push(id);
      }
    } else {
      this.muteds[roomId].splice(index, 1);
    }
    this.rooms[roomId].forEach((item) => {
      this.ws.sendMessage({
        type: MessageType.SET_MUTE,
        id: item.id,
        connId: '',
        data: {
          muteds: this.muteds[roomId],
          adminMuteds: this.adminMuteds[roomId],
        },
      });
      this.ws.sendMessage({
        type: MessageType.SET_MUTE_LIST,
        id: item.id,
        data: {
          muteds: this.muteds[roomId],
          adminMuteds: this.adminMuteds[roomId],
        },
        connId: '',
      });
    });
  }

  public handleGetToMute({
    id: roomId,
    data: { target },
  }: SendMessageArgs<MessageType.GET_TO_MUTE>) {
    if (!this.adminMuteds[roomId]) {
      this.adminMuteds[roomId] = [];
    }
    if (this.adminMuteds[roomId].indexOf(target) === -1) {
      this.adminMuteds[roomId].push(target);
    } else {
      log('warn', 'Duplicate to mute command', { roomId, target });
    }
    this.rooms[roomId].forEach((item) => {
      this.ws.sendMessage({
        type: MessageType.SET_MUTE,
        id: item.id,
        connId: '',
        data: {
          muteds: this.muteds[roomId],
          adminMuteds: this.adminMuteds[roomId],
        },
      });
      this.ws.sendMessage({
        type: MessageType.SET_MUTE_LIST,
        id: item.id,
        data: {
          muteds: this.muteds[roomId],
          adminMuteds: this.adminMuteds[roomId],
        },
        connId: '',
      });
    });
  }

  public handleGetToBan({
    id: roomId,
    data: { target, userId },
  }: SendMessageArgs<MessageType.GET_TO_BAN>) {
    if (!this.banneds[roomId]) {
      this.banneds[roomId] = [];
    }
    let index = -1;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.banneds[roomId].forEach((item, i) => {
      if (item.id === target) {
        index = i;
      }
    });
    if (index === -1) {
      const user = this.rooms[roomId].find((item) => item.id === target);
      if (user) {
        this.banneds[roomId].push(user);
      } else {
        log('warn', 'Banned user not found in room', { userId, target });
      }
    } else {
      log('warn', 'Duplicate to ban command', { roomId, target });
    }
    const locale = getLocale(this.ws.users[target].locale).server;
    const connId = this.ws.users[target]?.connId;
    this.ws.sendMessage({
      type: MessageType.SET_BAN_LIST,
      id: userId,
      data: {
        banneds: this.banneds[roomId],
      },
      connId: '',
    });
    this.ws.sendMessage(
      {
        type: MessageType.SET_ERROR,
        id: target,
        connId,
        data: {
          type: 'warn',
          code: ErrorCode.youAreBanned,
          message: locale.youAreBanned,
        },
      },
      false,
      () => {
        const socketId = this.ws.getSocketId(target, connId);
        if (connId && socketId) {
          this.ws.sockets[socketId].close();
        } else {
          log('warn', 'Banned for not connected', { target, connId, socketId });
        }
      }
    );
  }

  public handleGetToUnMute({
    id: roomId,
    data: { target },
  }: SendMessageArgs<MessageType.GET_TO_UNMUTE>) {
    if (!this.adminMuteds[roomId]) {
      this.adminMuteds[roomId] = [];
    }
    const index = this.adminMuteds[roomId].indexOf(target);
    if (index !== -1) {
      this.adminMuteds[roomId].splice(index, 1);
    } else {
      log('warn', 'Unmute of not muted', { roomId, target });
    }
    this.rooms[roomId].forEach((item) => {
      this.ws.sendMessage({
        type: MessageType.SET_MUTE,
        id: item.id,
        connId: '',
        data: {
          muteds: this.muteds[roomId],
          adminMuteds: this.adminMuteds[roomId],
        },
      });
      this.ws.sendMessage({
        type: MessageType.SET_MUTE_LIST,
        id: item.id,
        data: {
          muteds: this.muteds[roomId],
          adminMuteds: this.adminMuteds[roomId],
        },
        connId: '',
      });
    });
  }

  public handleGetToUnBan({
    id: roomId,
    data: { target, userId },
  }: SendMessageArgs<MessageType.GET_TO_UNBAN>) {
    if (!this.banneds[roomId]) {
      this.banneds[roomId] = [];
    }
    let index = -1;
    this.banneds[roomId].forEach((it, i) => {
      if (it.id === target) {
        index = i;
      }
    });
    if (index !== -1) {
      this.banneds[roomId].splice(index, 1);
    } else {
      log('warn', 'Unban of not banned', { roomId, target });
    }
    this.ws.sendMessage({
      type: MessageType.SET_BAN_LIST,
      id: userId,
      data: {
        banneds: this.banneds[roomId],
      },
      connId: '',
    });
  }
}

export default RTC;
