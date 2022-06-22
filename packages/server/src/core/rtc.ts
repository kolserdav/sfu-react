/******************************************************************************************
 * Repository: https://github.com/kolserdav/uyem.git
 * File name: rtc.ts
 * Author: Sergey Kolmiller
 * Email: <uyem.ru@gmail.com>
 * License: BSD-2-Clause
 * License text: Binary distributions of this software include 'wrtc' and other third-party libraries.
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Tue Jun 21 2022 08:50:18 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/
import wrtc from 'wrtc';
import { RTCInterface, MessageType, SendMessageArgs } from '../types/interfaces';
import { log } from '../utils/lib';
import WS from './ws';

class RTC implements RTCInterface {
  public peerConnections: RTCInterface['peerConnections'] = {};
  public readonly delimiter = '_';
  public rooms: Record<string, (string | number)[]> = {};
  public roomCons: Record<string, number | string> = {};
  private ws: WS;
  private streams: Record<string, MediaStream> = {};

  public onAddTrack: RTCInterface['onAddTrack'] = () => {
    /** */
  };

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

  public createRTC: RTCInterface['createRTC'] = ({ roomId, userId, target, connId }) => {
    const peerId = this.getPeerId(roomId, userId, target, connId);
    this.peerConnections[peerId] = new wrtc.RTCPeerConnection({
      iceServers:
        process.env.NODE_ENV === 'production'
          ? [
              {
                urls: ['stun:stun.l.google.com:19302'],
              },
            ]
          : [],
    });
    return this.peerConnections;
  };

  public handleIceCandidate: RTCInterface['handleIceCandidate'] = ({
    roomId,
    userId,
    target,
    connId,
  }) => {
    let peerId = this.getPeerId(roomId, userId, target, connId);
    if (!this.peerConnections[peerId]) {
      peerId = this.getPeerId(roomId, target, userId, connId);
    }
    if (!this.peerConnections[peerId]) {
      log('warn', 'Handle ice candidate without peerConnection', { peerId });
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const core = this;
    this.peerConnections[peerId]!.onicecandidate = function handleICECandidateEvent(
      event: RTCPeerConnectionIceEvent
    ) {
      if (event.candidate) {
        log('log', '* Outgoing ICE candidate:', { roomId, userId, target });
        core.ws.sendMessage({
          type: MessageType.CANDIDATE,
          id: roomId,
          data: {
            candidate: event.candidate,
            userId,
            target: 0,
          },
          connId,
        });
      }
    };
    const { ws, rooms, delimiter } = this;
    this.peerConnections[peerId]!.oniceconnectionstatechange =
      function handleICEConnectionStateChangeEvent() {
        log(
          'warn',
          `* ICE connection state changed to: ${core.peerConnections[peerId]?.iceConnectionState}`,
          { peerId }
        );
        if (
          core.peerConnections[peerId]?.iceConnectionState === 'connected' &&
          core.peerConnections[peerId]?.connectionState === 'connected'
        ) {
          // on connect notification
          const isRoom = peerId.split(delimiter)[2] === '0';
          if (isRoom) {
            rooms[roomId].forEach((id) => {
              ws.sendMessage({
                type: MessageType.SET_CHANGE_ROOM_UNIT,
                id,
                data: {
                  target: userId,
                  eventName: 'add',
                  roomLenght: rooms[roomId].length,
                },
                connId,
              });
            });
          }
        }
        switch (core.peerConnections[peerId]?.iceConnectionState) {
          case 'closed':
          case 'failed':
          case 'disconnected':
            core.onClosedCall({ roomId, userId, target, connId: connId });
            break;
        }
      };
    this.peerConnections[peerId]!.onicegatheringstatechange =
      function handleICEGatheringStateChangeEvent(ev: Event) {
        log(
          'log',
          `*** ICE gathering state changed to: ${core.peerConnections[peerId]!.iceGatheringState}`,
          { peerId }
        );
      };
    this.peerConnections[peerId]!.onsignalingstatechange =
      function handleSignalingStateChangeEvent() {
        log(
          'info',
          '! WebRTC signaling state changed to:',
          core.peerConnections[peerId]!.signalingState
        );
        switch (core.peerConnections[peerId]!.signalingState) {
          case 'closed':
            core.onClosedCall({ roomId, userId, target, connId });
            break;
        }
      };
    this.peerConnections[peerId]!.onnegotiationneeded = function handleNegotiationNeededEvent() {
      log('info', '--> Creating offer', {
        roomId,
        userId,
        target,
        state: core.peerConnections[peerId]!.signalingState,
      });
      core.peerConnections[peerId]!.createOffer()
        .then((offer): 1 | void | PromiseLike<void> => {
          if (!core.peerConnections[peerId]) {
            log(
              'warn',
              'Can not set local description because peerConnection is',
              core.peerConnections[peerId]
            );
            return 1;
          }
          return core.peerConnections[peerId]!.setLocalDescription(offer).catch((err) => {
            log('error', 'Error create local description', err);
          });
        })
        .then(() => {
          const { localDescription } = core.peerConnections[peerId]!;
          if (localDescription) {
            log('info', '---> Sending offer to remote peer', { roomId, userId, target });
            core.ws.sendMessage({
              id: roomId,
              type: MessageType.OFFER,
              data: {
                sdp: localDescription,
                userId,
                target: 0,
              },
              connId,
            });
          }
        });
    };
    this.peerConnections[peerId]!.ontrack = (e) => {
      const stream = e.streams[0];
      this.streams[peerId] = stream;
      this.onAddTrack(userId, stream);
    };
  };

  public handleCandidateMessage: RTCInterface['handleCandidateMessage'] = (msg, cb) => {
    const {
      id,
      connId,
      data: { candidate, userId, target },
    } = msg;

    const peerId = this.getPeerId(id, userId, target, connId);
    const cand = new wrtc.RTCIceCandidate(candidate);

    log('log', 'Trying to add ice candidate', {
      peerId,
      d: Object.keys(this.peerConnections).length,
      connId,
      id,
      userId,
      target,
    });

    if (
      !this.peerConnections[peerId] ||
      this.peerConnections[peerId]?.connectionState === 'closed'
    ) {
      log('info', 'Skiping add ice candidate', {
        connId,
        id,
        userId,
        target,
        state: this.peerConnections[peerId]?.connectionState,
        ice: this.peerConnections[peerId]?.iceConnectionState,
        ss: this.peerConnections[peerId]?.signalingState,
      });
      return;
    }
    if (cand.candidate === '') {
      return;
    }
    this.peerConnections[peerId]!.addIceCandidate(cand)
      .then(() => {
        log('log', '!! Adding received ICE candidate:', { userId, id, target });
        if (cb) {
          cb(cand);
        }
      })
      .catch((e) => {
        log('error', 'Set candidate error', {
          error: e.message,
          connId,
          id,
          userId,
          target,
          state: this.peerConnections[peerId]?.connectionState,
          ice: this.peerConnections[peerId]?.iceConnectionState,
          ss: this.peerConnections[peerId]?.signalingState,
        });
        this.ws.sendMessage({
          type: MessageType.SET_ERROR,
          id: userId,
          connId,
          data: {
            message: 'Set candidate error',
            context: { id, type: MessageType.SET_ERROR, data: { userId, target }, connId },
          },
        });
        if (cb) {
          cb(null);
        }
      });
  };

  public addUserToRoom({ userId, roomId }: { userId: number | string; roomId: number | string }) {
    if (!this.rooms[roomId]) {
      this.rooms[roomId] = [userId];
    } else if (this.rooms[roomId].indexOf(userId) === -1) {
      this.rooms[roomId].push(userId);
    }
  }

  public handleOfferMessage: RTCInterface['handleOfferMessage'] = (msg, cb) => {
    const {
      id,
      connId,
      data: { sdp, userId, target },
    } = msg;
    if (!sdp) {
      log('warn', 'Message offer error because sdp is:', sdp);
      if (cb) {
        cb(null);
      }
      return;
    }
    const peerId = this.getPeerId(id, userId, target, connId);

    this.createRTC({
      roomId: id,
      userId,
      target,
      connId,
    });

    if (!this.peerConnections[peerId]) {
      log('warn', 'Handle offer message without peer connection', { peerId });
      return;
    }

    this.handleIceCandidate({
      roomId: id,
      userId,
      target,
      connId,
    });
    const desc = new wrtc.RTCSessionDescription(sdp);
    this.peerConnections[peerId]!.setRemoteDescription(desc)
      .then(() => {
        log('info', '-> Local video stream obtained', { peerId });
        // If a user creates a new connection with a room to get another user's stream
        if (target) {
          let _connId = connId;
          Object.keys(this.streams).forEach((element) => {
            const str = element.split(this.delimiter);
            if (str[1] === target.toString() && str[2] === '0') {
              _connId = str[3];
            }
          });
          const _peerId = this.getPeerId(id, target, 0, _connId);
          const stream = this.streams[_peerId];
          if (!stream) {
            log('info', 'Skiping add track', {
              roomId: id,
              userId,
              target,
              connId,
            });
            return;
          }
          stream.getTracks().forEach((track) => {
            const sender = this.peerConnections[peerId]!.getSenders().find(
              (item) => item.track?.kind === track.kind
            );
            if (sender?.track?.id !== track.id) {
              this.peerConnections[peerId]!.addTrack(track, stream);
            } else {
              log('warn', 'Skiping add track track', { peerId });
            }
          });
        }
      })
      .then(() => {
        log('info', '--> Creating answer', { peerId });
        this.peerConnections[peerId]!.createAnswer().then((answ) => {
          if (!answ) {
            log('error', 'Failed set local description for answer.', {
              answ,
            });
            if (cb) {
              cb(null);
            }
            return;
          }
          log('info', '---> Setting local description after creating answer');
          let _peerId = peerId;
          if (!this.peerConnections[peerId]) {
            _peerId = this.getPeerId(id, target, userId, connId);
          }
          if (!this.peerConnections[_peerId]) {
            log('warn', 'Skip set local description fo answer', {
              roomId: id,
              userId,
              target,
              connId,
              k: Object.keys(this.peerConnections).length,
              s: Object.keys(this.streams).length,
              r: this.rooms[id].length,
            });
          }
          this.peerConnections[_peerId]!.setLocalDescription(answ)
            .catch((err) => {
              log('error', 'Error set local description for answer', {
                message: err.message,
                roomId: id,
                userId,
                target,
                connId,
                k: Object.keys(this.peerConnections).length,
                s: Object.keys(this.streams).length,
                r: this.rooms[id].length,
                is: this.peerConnections[peerId]?.iceConnectionState,
                cs: this.peerConnections[peerId]?.connectionState,
                ss: this.peerConnections[peerId]?.signalingState,
              });
            })
            .then(() => {
              const { localDescription } = this.peerConnections[peerId]!;
              if (localDescription) {
                log('info', 'Sending answer packet back to other peer', {
                  peerId,
                });
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
                if (cb) {
                  cb(localDescription);
                }
              } else {
                log('warn', 'Failed send answer because localDescription is', localDescription);
              }
            });
        });
      })
      .catch((e) => {
        log('error', 'Failed get user media', {
          message: e.message,
          roomId: id,
          userId,
          target,
          connId,
          desc,
        });
        if (cb) {
          cb(null);
        }
      });
  };

  public handleVideoAnswerMsg: RTCInterface['handleVideoAnswerMsg'] = (msg, cb) => {
    const {
      id,
      connId,
      data: { sdp, userId, target },
    } = msg;
    // TODO maybe wrong
    const peerId = this.getPeerId(userId, id, target, connId);
    log('info', '----> Call recipient has accepted our call', { userId, target });
    if (
      !this.peerConnections[peerId] ||
      this.peerConnections[peerId]?.signalingState === 'stable'
    ) {
      log('warn', 'Skiping video answer', { peerId });
      return;
    }
    const desc = new wrtc.RTCSessionDescription(sdp);
    this.peerConnections[peerId]!.setRemoteDescription(desc)
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

  public closeVideoCall: RTCInterface['closeVideoCall'] = ({ roomId, userId, target, connId }) => {
    const peerId = this.getPeerId(roomId, userId, target, connId);
    delete this.streams[peerId];
    if (!this.peerConnections[peerId]) {
      log('warn', 'Close video call without peer connection', { peerId });
      return;
    }
    log('info', '| Closing the call', { peerId, k: Object.keys(this.peerConnections).length });
    this.peerConnections[peerId]!.onicecandidate = null;
    this.peerConnections[peerId]!.oniceconnectionstatechange = null;
    this.peerConnections[peerId]!.onicegatheringstatechange = null;
    this.peerConnections[peerId]!.onsignalingstatechange = null;
    this.peerConnections[peerId]!.onnegotiationneeded = null;
    this.peerConnections[peerId]!.ontrack = null;
    this.peerConnections[peerId]!.close();
    delete this.peerConnections[peerId];
  };

  public handleGetRoomMessage({
    message,
    port,
  }: {
    message: SendMessageArgs<MessageType.GET_ROOM>;
    port: number;
  }) {
    const {
      data: { userId: uid },
      id,
      connId,
    } = message;
    // Room creatting counter local connection with every user
    const connection = new this.ws.websocket(`ws://localhost:${port}`);
    this.addUserToRoom({
      roomId: id,
      userId: uid,
    });
    this.createRTC({ roomId: id, userId: uid, target: 0, connId });
    connection.onopen = () => {
      // FIXME to sendMEssage
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
          }
        }
      };
    };
    this.ws.sendMessage({
      type: MessageType.SET_ROOM,
      id,
      data: undefined,
      connId,
    });
  }

  public onClosedCall: RTCInterface['onClosedCall'] = (args) => {
    log('log', 'Call is closed', { ...args });
  };

  public cleanConnections(roomId: string, userId: string) {
    const peerKeys = Object.keys(this.peerConnections);
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
