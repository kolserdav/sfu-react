/******************************************************************************************
 * Repository: https://github.com/kolserdav/werift-sfu-react.git
 * File name: rtc.ts
 * Author: Sergey Kolmiller
 * Email: <uyem.ru@gmail.com>
 * License: MIT
 * License text: See in LICENSE file
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Fri Jul 29 2022 21:35:51 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/
// eslint-disable-next-line import/no-relative-packages
//import * as werift from '../werift-webrtc/packages/webrtc/lib/webrtc/src/index';
import * as werift from 'werift';
import { RTCInterface, MessageType, SendMessageArgs, AddTracksProps } from '../types/interfaces';
import { log } from '../utils/lib';
import WS from './ws';
import DB from './db';

const db = new DB();

class RTC implements Omit<RTCInterface, 'peerConnections' | 'createRTC'> {
  public peerConnectionsServer: RTCInterface['peerConnectionsServer'] = {};

  public readonly delimiter = '_';

  public rooms: Record<string | number, (string | number)[]> = {};

  public muteds: Record<string, string[]> = {};

  private ws: WS;

  public streams: Record<string, werift.MediaStreamTrack[]> = {};

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
  }

  public createRTCServer: RTCInterface['createRTCServer'] = (opts) => {
    const { roomId, userId, target, connId, mimeType } = opts;
    const peerId = this.getPeerId(roomId, userId, target, connId);
    if (this.peerConnectionsServer[peerId]) {
      log('warn', 'Duplicate peer connection', opts);
    } else {
      log('info', 'Creating peer connection', opts);
    }
    this.peerConnectionsServer[peerId] = new werift.RTCPeerConnection({
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
    });

    return this.peerConnectionsServer;
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
    if (!this.peerConnectionsServer[peerId]) {
      log('warn', 'Handle ice candidate without peerConnection', { peerId });
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const core = this;
    const { ws, delimiter, rooms } = this;
    const { addTracks, peerConnectionsServer } = this;
    this.peerConnectionsServer[peerId]!.onsignalingstatechange =
      function handleSignalingStateChangeEvent() {
        if (!core.peerConnectionsServer[peerId]) {
          log('warn', 'On signalling state change without peer connection', { peerId });
          return;
        }
        const state = peerConnectionsServer[peerId].signalingState;
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
          core.peerConnectionsServer[peerId]!.signalingState
        );
        switch (core.peerConnectionsServer[peerId]!.signalingState) {
          case 'closed':
            core.onClosedCall({ roomId, userId, target, connId });
            break;
          default:
        }
      };
    this.peerConnectionsServer[peerId]!.ontrack = (e) => {
      const peer = peerId.split(delimiter);
      const isRoom = peer[2] === '0';
      const stream = e.streams[0];
      const isNew = !this.streams[peerId]?.length;
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
        if (!this.streams[peerId]) {
          this.streams[peerId] = [];
        }
        this.streams[peerId].push(stream.getTracks()[0]);
        const room = rooms[roomId];
        if (room && isNew) {
          setTimeout(() => {
            room.forEach((id) => {
              ws.sendMessage({
                type: MessageType.SET_CHANGE_UNIT,
                id,
                data: {
                  target: userId,
                  eventName: 'add',
                  roomLenght: rooms[roomId]?.length || 0,
                  muteds: this.muteds[roomId],
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
      data: { candidate, userId, target },
    } = msg;
    const peerId = this.getPeerId(id, userId, target, connId);

    const cand = new werift.RTCIceCandidate(candidate as werift.RTCIceCandidate);

    log('log', 'Trying to add ice candidate:', {
      peerId,
      d: Object.keys(this.peerConnectionsServer).length,
      connId,
      id,
      userId,
      target,
    });
    if (!this.peerConnectionsServer[peerId]) {
      log('warn', 'Skiping add ice candidate', {
        connId,
        id,
        userId,
        peerId,
        target,
        state: this.peerConnectionsServer[peerId]?.connectionState,
        ice: this.peerConnectionsServer[peerId]?.iceConnectionState,
        ss: this.peerConnectionsServer[peerId]?.signalingState,
      });
      return;
    }
    if (cand.candidate === '') {
      return;
    }
    this.peerConnectionsServer[peerId]!.addIceCandidate(cand)
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
          state: this.peerConnectionsServer[peerId]?.connectionState,
          ice: this.peerConnectionsServer[peerId]?.iceConnectionState,
          ss: this.peerConnectionsServer[peerId]?.signalingState,
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
      data: { sdp, userId, target, mimeType },
    } = msg;
    if (!sdp) {
      log('warn', 'Message offer error because sdp is:', sdp);
      return;
    }
    const peerId = this.getPeerId(id, userId, target, connId);
    log('info', '--> Creating answer', {
      peerId,
      ss: this.peerConnectionsServer[peerId]?.signalingState,
    });
    this.createRTCServer({
      roomId: id,
      userId,
      target,
      connId,
      mimeType,
    });
    if (!this.peerConnectionsServer[peerId]) {
      log('warn', 'Handle offer message without peer connection', { peerId });
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
    await this.peerConnectionsServer[peerId]!.setRemoteDescription(desc).catch((e) => {
      log('error', 'Error set remote description', { e: e.message, stack: e.stack, peerId });
      error = true;
    });
    const answ = await this.peerConnectionsServer[peerId]!.createAnswer().catch((e) => {
      log('error', 'Error create answer', {
        e: e.message,
        stack: e.stack,
        peerId,
        state: this.peerConnectionsServer[peerId]?.connectionState,
        SState: this.peerConnectionsServer[peerId]?.signalingState,
      });
      error = true;
    });
    if (!answ) {
      log('warn', 'Failed set remote description for answer.', {
        answ,
        peerId,
      });
      error = true;
      return;
    }
    log('info', '---> Setting local description after creating answer');
    if (!this.peerConnectionsServer[peerId] || error) {
      log('warn', 'Failed set local description fo answer', {
        error,
        roomId: id,
        userId,
        target,
        connId,
        k: Object.keys(this.peerConnectionsServer).length,
        s: Object.keys(this.streams).length,
      });
      return;
    }
    await this.peerConnectionsServer[peerId]!.setLocalDescription(answ).catch((err) => {
      log('error', 'Error set local description for answer', {
        message: err.message,
        roomId: id,
        userId,
        target,
        connId,
        k: Object.keys(this.peerConnectionsServer).length,
        s: Object.keys(this.streams).length,
        is: this.peerConnectionsServer[peerId]?.iceConnectionState,
        cs: this.peerConnectionsServer[peerId]?.connectionState,
        ss: this.peerConnectionsServer[peerId]?.signalingState,
      });
      error = true;
    });
    const { localDescription } = this.peerConnectionsServer[peerId]!;
    if (localDescription) {
      log('info', 'Sending answer packet back to other peer', { userId, target, id });
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

  public handleVideoAnswerMsg: RTCInterface['handleVideoAnswerMsg'] = async (msg, cb) => {
    const {
      id,
      connId,
      data: { sdp, userId, target },
    } = msg;
    const peerId = this.getPeerId(userId, id, target, connId);
    log('info', '----> Call recipient has accepted our call', {
      id,
      userId,
      target,
      peerId,
      s: this.peerConnectionsServer[peerId]?.connectionState,
      is: this.peerConnectionsServer[peerId]?.iceConnectionState,
    });
    if (!this.peerConnectionsServer[peerId]) {
      await new Promise((resolve) => {
        setTimeout(() => {
          resolve(0);
        }, 1000);
      });
    }
    if (!this.peerConnectionsServer[peerId]) {
      log('warn', 'Skiping set remote desc for answer', {
        id,
        userId,
        target,
        peerId,
        peer: this.peerConnectionsServer[peerId],
      });
      return;
    }
    const desc = new werift.RTCSessionDescription(sdp.sdp as string, 'answer');
    this.peerConnectionsServer[peerId]!.setRemoteDescription(desc)
      .then(() => {
        if (cb) {
          cb(0);
        }
      })
      .catch((e) => {
        log('error', 'Error set description for answer', e);
        if (cb) {
          cb(1);
        }
      });
  };

  private getStreamConnId(userId: string | number) {
    let _connId = '';
    const keys = Object.keys(this.streams);
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

  private getPeerConnId(userId: string | number, target: number | string) {
    let _connId = '';
    const keys = Object.keys(this.peerConnectionsServer);
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

  public addTracks: RTCInterface['addTracks'] = ({ roomId, connId, userId, target }) => {
    const _connId = this.getStreamConnId(target);
    const _connId1 = this.getPeerConnId(userId, target);
    const peerId = this.getPeerId(roomId, userId, target, _connId1);
    const _peerId = this.getPeerId(roomId, target, 0, _connId);
    const tracks = this.streams[_peerId];
    const streams = Object.keys(this.streams);
    const opts = {
      roomId,
      userId,
      target,
      connId,
      _peerId,
      peerId,
      tracksL: tracks?.length,
      tracks: tracks?.map((item) => item.kind),
      peers: Object.keys(this.peerConnectionsServer),
      ssL: streams.length,
      ss: streams,
      cS: this.peerConnectionsServer[peerId]?.connectionState,
      sS: this.peerConnectionsServer[peerId]?.signalingState,
      iS: this.peerConnectionsServer[peerId]?.iceConnectionState,
    };
    if (!tracks || tracks?.length === 0) {
      log('warn', 'Skiping add track', opts);
      return;
    }
    if (this.peerConnectionsServer[peerId]) {
      log('warn', 'Add tracks', opts);
      tracks.forEach((track) => {
        this.peerConnectionsServer[peerId]!.addTrack(track);
      });
    } else {
      log('error', 'Can not add tracks', { opts });
    }
  };

  public closeVideoCall: RTCInterface['closeVideoCall'] = ({ roomId, userId, target, connId }) => {
    const peerId = this.getPeerId(roomId, userId, target, connId);
    delete this.streams[peerId];
    if (!this.peerConnectionsServer[peerId]) {
      log('warn', 'Close video call without peer connection', { peerId });
      return;
    }
    log('info', '| Closing the call', {
      peerId,
      k: Object.keys(this.peerConnectionsServer).length,
    });
    setTimeout(() => {
      if (this.peerConnectionsServer[peerId]) {
        this.peerConnectionsServer[peerId]!.onsignalingstatechange = null;
        this.peerConnectionsServer[peerId]!.onnegotiationneeded = null;
        this.peerConnectionsServer[peerId]!.ontrack = null;
        this.peerConnectionsServer[peerId]!.close();
        delete this.peerConnectionsServer[peerId];
      }
    }, 1000);
  };

  public async addUserToRoom({
    userId,
    roomId,
  }: {
    userId: number | string;
    roomId: number | string;
  }): Promise<1 | 0> {
    const room = await db.roomFindFirst({
      where: {
        id: roomId.toString(),
      },
    });
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
    } else {
      if (room.archive) {
        if (room.authorId !== userId.toString()) {
          this.ws.sendMessage({
            type: MessageType.SET_ERROR,
            id: userId,
            connId: '',
            data: {
              message: 'Room is inactive',
              context: {
                id: userId,
                type: MessageType.SET_ROOM,
                connId: '',
                data: {
                  roomId,
                },
              },
            },
          });
          if (!this.rooms[roomId]) {
            this.rooms[roomId] = [];
            this.muteds[roomId] = [];
          }
          return 1;
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
    if (!this.rooms[roomId]) {
      this.rooms[roomId] = [userId];
      this.muteds[roomId] = [];
    } else if (this.rooms[roomId].indexOf(userId) === -1) {
      this.rooms[roomId].push(userId);
    } else {
      log('info', 'Room exists and user added before.', { roomId, userId });
    }
    return 0;
  }

  public async handleGetRoomMessage({
    message,
    port,
    cors,
  }: {
    message: SendMessageArgs<MessageType.GET_ROOM>;
    port: number;
    cors: string;
  }) {
    log('log', 'Get room message', message);
    const {
      data: { userId: uid, mimeType },
      id,
      connId,
    } = message;
    const error = await this.addUserToRoom({
      roomId: id,
      userId: uid,
    });
    if (error) {
      this.ws.sendMessage({
        type: MessageType.SET_ROOM,
        id: uid,
        data: undefined,
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
            case MessageType.ANSWER:
              this.handleVideoAnswerMsg(msg);
              break;
            case MessageType.CANDIDATE:
              this.handleCandidateMessage(msg);
              break;
            default:
          }
        }
      };
    };
    this.ws.sendMessage({
      type: MessageType.SET_ROOM,
      id: uid,
      data: undefined,
      connId,
    });
  }

  // eslint-disable-next-line class-methods-use-this
  public onClosedCall: RTCInterface['onClosedCall'] = (args) => {
    log('info', 'Call is closed', { ...args });
  };

  public cleanConnections(roomId: string, userId: string) {
    const peerKeys = Object.keys(this.peerConnectionsServer);
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
}

export default RTC;
