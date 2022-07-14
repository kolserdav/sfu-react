/******************************************************************************************
 * Repository: https://github.com/kolserdav/react-node-webrtc-sfu.git
 * File name: rtc.ts
 * Author: Sergey Kolmiller
 * Email: <uyem.ru@gmail.com>
 * License: BSD-2-Clause
 * License text: Binary distributions of this software include 'wrtc' and other third-party libraries.
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Mon Jul 04 2022 10:58:51 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/
import 'webrtc-adapter';
import { RTCInterface, MessageType } from '../types/interfaces';
import { log } from '../utils/lib';
import WS from './ws';

class RTC implements RTCInterface {
  public peerConnections: RTCInterface['peerConnections'] = {};

  public readonly delimiter = '_';

  public roomLength = 0;

  public streams: Record<string, MediaStream> = {};

  public connId = '';

  public room: (string | number)[] = [];

  public isRoom = false;

  public muteds: string[] = [];

  public localTrackSettings: MediaTrackSettings | null = null;

  // eslint-disable-next-line class-methods-use-this
  public lostStreamHandler: (args: { target: number | string; connId: string }) => void = () => {
    /** */
  };

  private ws: WS;

  public localStream: MediaStream | null = null;

  public roomId: number | null = null;

  constructor({ ws }: { ws: WS }) {
    this.ws = ws;
  }

  public createPeerConnection({
    roomId,
    userId,
    target,
    connId,
    onTrack,
    iceServers,
    eventName,
  }: {
    roomId: string | number;
    userId: string | number;
    target: string | number;
    connId: string;
    onTrack: (args: { addedUserId: string | number; stream: MediaStream; connId: string }) => void;
    iceServers: RTCConfiguration['iceServers'];
    eventName: 'first' | 'check' | 'back';
  }) {
    const peerId = this.getPeerId(roomId, userId, target, connId);
    this.createRTC({ roomId, target, userId, connId, iceServers });
    this.onAddTrack[peerId] = (addedUserId, stream) => {
      log('info', 'On track peer', { userId, target, connId, eventName });
      onTrack({ addedUserId, stream, connId });
    };
    this.invite({ roomId, userId, target, connId });
  }

  public createRTC: RTCInterface['createRTC'] = ({
    connId,
    roomId,
    target,
    userId,
    iceServers = [],
  }) => {
    if (!connId) {
      log('warn', 'Connection id is: ', { connId });
    }
    this.peerConnections[this.getPeerId(roomId, userId, target, connId)] = new RTCPeerConnection({
      iceServers,
    });
    return this.peerConnections;
  };

  public getPeerId(
    roomId: number | string,
    userId: number | string,
    target: number | string,
    connId: string
  ) {
    return `${roomId}${this.delimiter}${userId}${this.delimiter}${target || 0}${
      this.delimiter
    }${connId}`;
  }

  public handleIceCandidate: RTCInterface['handleIceCandidate'] = ({
    connId,
    roomId,
    userId,
    target,
  }) => {
    let peerId = this.getPeerId(roomId, userId, target, connId);
    if (!this.peerConnections[peerId]) {
      peerId = this.getPeerId(roomId, userId, target, connId);
    }
    if (!this.peerConnections[peerId]) {
      log('warn', 'Handle ice candidate without peerConnection', { peerId });
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const core = this;
    this.peerConnections[peerId]!.onconnectionstatechange = (e) => {
      const { currentTarget }: { currentTarget: RTCPeerConnection } = e as any;
      log('info', 'Peer connection change state to:', {
        cs: currentTarget.connectionState,
        peerId,
      });
      switch (currentTarget.connectionState) {
        case 'closed':
        case 'disconnected':
        case 'failed':
          this.lostStreamHandler({
            target: peerId.split(this.delimiter)[1],
            connId: peerId.split(this.delimiter)[2],
          });
          log('warn', 'Failed connection state', { cs: currentTarget.connectionState, peerId });
          break;
        default:
      }
    };
    this.peerConnections[peerId]!.onicecandidate = function handleICECandidateEvent(
      event: RTCPeerConnectionIceEvent
    ) {
      if (event.candidate) {
        log('info', '* Outgoing ICE candidate:', {
          roomId,
          userId,
          target,
          connId,
          d: Object.keys(core.peerConnections),
        });
        core.ws.sendMessage({
          type: MessageType.CANDIDATE,
          id: roomId,
          data: {
            candidate: event.candidate,
            userId,
            target,
          },
          connId,
        });
      }
    };
    this.peerConnections[peerId]!.oniceconnectionstatechange =
      function handleICEConnectionStateChangeEvent(event: Event) {
        log(
          'log',
          `* ICE connection state changed to: ${core.peerConnections[peerId]?.iceConnectionState}`,
          { peerId }
        );
        switch (core.peerConnections[peerId]?.iceConnectionState) {
          case 'closed':
          case 'failed':
          case 'disconnected':
            core.onClosedCall({ roomId, userId, target, connId });
            break;
        }
      };
    this.peerConnections[peerId]!.onicegatheringstatechange =
      function handleICEGatheringStateChangeEvent(ev: Event) {
        if (!core.peerConnections[peerId]) {
          log('warn', 'On ice gathering state without peer connection', { peerId });
          return;
        }
        log(
          'log',
          `*** ICE gathering state changed to: ${core.peerConnections[peerId]!.iceGatheringState}`,
          { peerId }
        );
      };
    this.peerConnections[peerId]!.onsignalingstatechange =
      function handleSignalingStateChangeEvent() {
        if (!core.peerConnections[peerId]) {
          log('warn', 'On signalling state change without peer connection', { peerId });
          return;
        }
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
      if (!core.peerConnections[peerId]) {
        log('warn', 'On negotiation needed without peer connection', { peerId });
        return;
      }
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
            log('error', 'Error create local description', {
              err,
              peerId,
              peer: core.peerConnections[peerId],
            });
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
                target,
              },
              connId,
            });
          }
        });
    };
    let s = 1;
    this.peerConnections[peerId]!.ontrack = (e) => {
      const stream = e.streams[0];
      log('info', 'On add remote stream', {
        target,
        userId,
        streamId: stream.id,
        tracks: stream.getTracks(),
        t: Object.keys(this.onAddTrack),
      });
      const isRoom = peerId.split(this.delimiter)[2] === '0';
      if (this.isRoom && isRoom) {
        const _stream = e.streams[0];
        const isNew = _stream.id !== this.streams[peerId]?.id;
        if (isNew) {
          this.streams[peerId] = _stream;
          console.error(peerId);
        }
        log('info', 'ontrack  ', {
          peerId,
          si: stream.id,
          isNew,
          userId,
          target,
          k: Object.keys(this.streams),
        });
        if (s % 2 !== 0 && isNew) {
          const { room } = this;
          setTimeout(() => {
            room.forEach((id) => {
              if (id.toString() !== this.ws.userId.toString()) {
                this.ws.sendMessage({
                  type: MessageType.SET_CHANGE_UNIT,
                  id,
                  data: {
                    target: userId,
                    eventName: 'add',
                    roomLenght: room.length || 0,
                    muteds: this.muteds,
                  },
                  connId,
                });
              }
            });
          }, 0);
        }
        s++;
      } else if (target.toString() !== '0' && !this.isRoom) {
        this.onAddTrack[this.getPeerId(roomId, userId, target, connId)](target, stream);
      } else {
        this.addTracks({ id: roomId, userId, target, connId }, () => {
          log('warn', 'On add remote track', { peerId });
        });
      }
    };
  };

  public invite({
    roomId,
    userId,
    target,
    connId,
  }: {
    roomId: number | string;
    userId: number | string;
    target: number | string;
    connId: string;
  }) {
    this.handleIceCandidate({ connId, roomId, userId, target });
  }

  public addTracks: RTCInterface['addTracks'] = ({ id, userId, target, connId }, cb) => {
    const peerId = this.getPeerId(id, userId, target, connId);
    log('warn', 'Add tracks', { peerId });
    if (!this.peerConnections[peerId]) {
      log('warn', 'Set media without peer connection', {
        peerId,
        k: Object.keys(this.peerConnections),
      });
      return;
    }
    if (this.isRoom) {
      let _connId = connId;
      const keysStreams = Object.keys(this.streams);
      keysStreams.forEach((element) => {
        const str = element.split(this.delimiter);
        if (str[1] === target.toString() && str[2] === '0') {
          // eslint-disable-next-line prefer-destructuring
          _connId = str[3];
        }
      });
      const _peerId = this.getPeerId(id, userId, 0, _connId);
      const stream = this.streams[_peerId];
      if (!stream) {
        log('warn', 'Skiping add track', {
          roomId: id,
          userId,
          target,
          connId,
          _peerId,
          _connId,
          k: Object.keys(this.streams),
        });
        return;
      }
      const tracks = stream.getTracks();
      tracks.forEach((track) => {
        if (this.peerConnections[peerId]) {
          const sender = this.peerConnections[peerId]
            ?.getSenders()
            .find((item) => item.track?.kind === track.kind);
          if (sender?.track?.id !== track.id) {
            this.peerConnections[peerId]!.addTrack(track, stream);
          } else {
            log('warn', 'Skiping add track', { peerId });
          }
        } else {
          log('warn', 'Add track without peer connection', {
            peerId,
            k: Object.keys(this.peerConnections),
          });
        }
      });
    } else if (!this.localStream) {
      navigator.mediaDevices
        .getUserMedia({
          video: true,
          audio: true,
        })
        .then((localStream) => {
          this.localStream = localStream;
          if (!this.ws.shareScreen) {
            log('info', '> Adding tracks to new local media stream', {
              streamId: localStream.id,
            });
            localStream.getTracks().forEach((track) => {
              this.peerConnections[peerId]!.addTrack(track, localStream);
            });
            this.onAddTrack[peerId](userId, this.localStream);
            cb(0);
          } else {
            navigator.mediaDevices
              .getDisplayMedia({ video: true })
              .then((videoStream) => {
                this.localStream = new MediaStream();
                localStream.getTracks().forEach((track) => {
                  if (track.kind === 'audio') {
                    this.peerConnections[peerId]!.addTrack(track, videoStream);
                    this.localStream?.addTrack(track);
                  } else {
                    const sender = this.peerConnections[peerId]!.getSenders().find(
                      (item) => item.track?.kind === 'video'
                    );
                    if (sender) {
                      this.peerConnections[peerId]!.removeTrack(sender);
                    }
                  }
                });
                videoStream.getTracks().forEach((track) => {
                  if (track.kind === 'video') {
                    this.peerConnections[peerId]!.addTrack(track, videoStream);
                    this.localStream?.addTrack(track);
                  }
                });
                this.onAddTrack[peerId](userId, videoStream);
                cb(0);
              })
              .catch(() => {
                cb(1);
              });
          }
        })
        .catch((err) => {
          log('error', 'Error get self user media', err);
          cb(1);
        });
    } else {
      log('info', '> Adding tracks to current local media stream', {
        streamId: this.localStream.id,
      });
      this.localStream.getTracks().forEach((track) => {
        if (this.localStream) {
          const sender = this.peerConnections[peerId]!.getSenders().find(
            (item) => item.track?.kind === track.kind
          );
          if (sender) {
            this.peerConnections[peerId]!.removeTrack(sender);
          }
          this.peerConnections[peerId]!.addTrack(track, this.localStream);
        }
      });
      this.onAddTrack[this.getPeerId(id, userId, target, connId)](userId, this.localStream);
      cb(0);
    }
  };

  // eslint-disable-next-line class-methods-use-this
  public onAddTrack: Record<string, (target: number | string, stream: MediaStream) => void> = {};

  /**
   * handleNewICECandidateMsg
   */
  public handleCandidateMessage: RTCInterface['handleCandidateMessage'] = (msg, cb) => {
    const {
      id,
      connId,
      data: { candidate, target, userId },
    } = msg;
    const peerId = this.getPeerId(id, this.isRoom ? userId : this.ws.userId, target, connId);
    if (!this.peerConnections[peerId]) {
      log('warn', 'Handle candidatte without peer connection', { peerId });
      return;
    }
    const cand = new RTCIceCandidate(candidate);
    if (cand.candidate === '') {
      return;
    }
    log('info', 'Trying to add ice candidate', { peerId });
    this.peerConnections[peerId]!.addIceCandidate(cand)
      .then(() => {
        log('log', '!! Adding received ICE candidate:', { id, target, userId });
        if (cb) {
          cb(cand);
        }
      })
      .catch((e) => {
        log('error', 'Set candidate error', {
          error: e,
          cand,
        });
        if (cb) {
          cb(null);
        }
      });
  };

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
    log('info', 'Handle offer message', {
      roomId: id,
      userId: this.isRoom ? userId : this.ws.userId,
      target,
      connId,
    });
    if (!this.peerConnections[peerId]) {
      log('warn', 'Handle offer message without peer connection', {
        peerId,
        r: this.isRoom,
        userId,
        uid: this.ws.userId,
        k: Object.keys(this.peerConnections),
      });
      return;
    }

    this.roomId = this.getRoom();
    this.handleIceCandidate({
      roomId: id,
      userId,
      target,
      connId,
    });
    const desc = new RTCSessionDescription(sdp);
    this.peerConnections[peerId]!.setRemoteDescription(desc)
      .then(() => {
        log('info', '-> Local video stream obtained', { peerId });
        // If a user creates a new connection with a room to get another user's stream
        if (target && this.isRoom) {
          this.addTracks({ id, peerId, connId, target, userId }, () => {
            /** */
          });
        }
        log('info', '--> Creating answer', { peerId });
        this.peerConnections[peerId]!.createAnswer().then((answ) => {
          if (!answ || !this.peerConnections[peerId]) {
            log('error', 'Failed set local description for answer.', {
              answ,
              peerConnection: this.peerConnections[peerId],
            });
            if (cb) {
              cb(null);
            }
            return;
          }
          log('info', '---> Setting local description after creating answer');
          this.peerConnections[peerId]!.setLocalDescription(answ)
            .catch((err) => {
              log('error', 'Error set local description for answer', {
                message: err.message,
                roomId: id,
                userId,
                target,
                connId,
                k: Object.keys(this.peerConnections).length,
                is: this.peerConnections[peerId]?.iceConnectionState,
                cs: this.peerConnections[peerId]?.connectionState,
                ss: this.peerConnections[peerId]?.signalingState,
              });
            })
            .then(() => {
              const { localDescription } = this.peerConnections[peerId]!;
              if (localDescription) {
                log('info', 'Sending answer packet back to other peer', { userId, target, id });
                if (id !== this.ws.userId) {
                  this.ws.sendMessage({
                    id,
                    type: MessageType.ANSWER,
                    data: {
                      sdp: localDescription,
                      userId,
                      target,
                    },
                    connId,
                  });
                } else {
                  log('log', 'User id is is for answer', { id, userId });
                }
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
          stack: e.stack,
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

  public handleVideoAnswerMsg: RTCInterface['handleVideoAnswerMsg'] = async (msg, cb) => {
    const {
      id,
      connId,
      data: { sdp, userId, target },
    } = msg;
    const peerId = this.getPeerId(id, userId, target, connId);
    log('info', '----> Call recipient has accepted our call', {
      id,
      userId,
      target,
      peerId,
      uid: this.ws.userId,
      s: this.peerConnections[peerId]?.connectionState,
      is: this.peerConnections[peerId]?.iceConnectionState,
    });
    const desc = new RTCSessionDescription(sdp);
    if (!this.peerConnections[peerId]) {
      await new Promise((resolve) => {
        setTimeout(() => {
          resolve(0);
        }, 1000);
      });
    }
    if (!this.peerConnections[peerId]) {
      log('warn', 'Skiping set remote desc for answer', {
        id,
        userId,
        target,
        peerId,
        peer: this.peerConnections[peerId],
      });
      return;
    }
    this.peerConnections[peerId]!.setRemoteDescription(desc)
      .then(() => {
        if (cb) {
          cb(0);
        }
      })
      .catch((e) => {
        log('error', 'Error set description for answer:', {
          message: e.message,
          id,
          userId,
          target,
          peerId,
          peer: this.peerConnections[peerId],
        });
        if (cb) {
          cb(1);
        }
      });
  };

  // eslint-disable-next-line class-methods-use-this
  public closeVideoCall: RTCInterface['closeVideoCall'] = ({ roomId, target, connId, userId }) => {
    const peerId = this.getPeerId(roomId, userId, target, connId);
    this.closeByPeer(peerId);
  };

  public closeByPeer = (peerId: string) => {
    if (!this.peerConnections[peerId]) {
      log('info', `Close video call without peer connection ${peerId}`, {
        r: Object.keys(this.peerConnections),
      });
      return;
    }
    log('info', '| Closing the call', { peerId, k: Object.keys(this.peerConnections) });
    this.peerConnections[peerId]!.onicecandidate = null;
    this.peerConnections[peerId]!.oniceconnectionstatechange = null;
    this.peerConnections[peerId]!.onicegatheringstatechange = null;
    this.peerConnections[peerId]!.onsignalingstatechange = null;
    this.peerConnections[peerId]!.onnegotiationneeded = null;
    this.peerConnections[peerId]!.ontrack = null;
    this.peerConnections[peerId]!.close();
    delete this.peerConnections[peerId];
    delete this.onAddTrack[peerId];
  };

  private getRoom() {
    this.roomId = parseInt(window.location.pathname.replace('/', '').replace(/\?.*$/, ''), 10);
    return this.roomId;
  }

  // eslint-disable-next-line class-methods-use-this
  public onClosedCall: RTCInterface['onClosedCall'] = (args) => {
    log('warn', 'Call is closed', { ...args });
  };

  public closeAllConnections() {
    this.ws.connection.close();
    this.localStream = null;
    Object.keys(this.peerConnections).forEach((item) => {
      this.closeByPeer(item);
    });
  }

  public parsePeerId({ target }: { target: string | number }) {
    let peer: string[] = [];
    Object.keys(this.peerConnections).forEach((item) => {
      const _peer = item.split(this.delimiter);
      if (_peer[1] === target.toString()) {
        peer = _peer;
      }
    });
    return peer;
  }
}

export default RTC;
