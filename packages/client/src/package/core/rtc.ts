/******************************************************************************************
 * Repository: https://github.com/kolserdav/react-node-webrtc-sfu.git
 * File name: rtc.ts
 * Author: Sergey Kolmiller
 * Email: <uyem.ru@gmail.com>
 * License: MIT
 * License text:
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Thu Jul 14 2022 16:24:49 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/
import 'webrtc-adapter';
import { RTCInterface, MessageType } from '../types/interfaces';
import { log } from '../utils/lib';
import WS from './ws';

class RTC implements Omit<RTCInterface, 'peerConnectionsServer' | 'createRTCServer'> {
  public peerConnections: RTCInterface['peerConnections'] = {};

  public readonly delimiter = '_';

  public roomLength = 0;

  public connId = '';

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
    const peerId = this.getPeerId(roomId, target, connId);
    this.createRTC({ roomId, target, userId, connId, iceServers });
    this.onAddTrack[peerId] = (addedUserId, stream) => {
      log('info', 'On track peer', {
        sid: stream.id,
        userId,
        target,
        connId,
        eventName,
        tracks: stream.getTracks(),
      });
      onTrack({ addedUserId, stream, connId });
    };
    this.invite({ roomId, userId, target, connId });
  }

  public createRTC: RTCInterface['createRTC'] = ({ connId, roomId, target, iceServers = [] }) => {
    if (!connId) {
      log('warn', 'Connection id is: ', { connId });
    }
    this.peerConnections[this.getPeerId(roomId, target, connId)] = new RTCPeerConnection({
      iceServers,
    });
    return this.peerConnections;
  };

  public getPeerId(roomId: number | string, target: number | string, connId: string) {
    return `${roomId}${this.delimiter}${target || 0}${this.delimiter}${connId}`;
  }

  public handleIceCandidate: RTCInterface['handleIceCandidate'] = ({
    connId,
    roomId,
    userId,
    target,
  }) => {
    let peerId = this.getPeerId(roomId, target, connId);
    if (!this.peerConnections[peerId]) {
      peerId = this.getPeerId(roomId, target, connId);
    }
    if (!this.peerConnections[peerId]) {
      log('warn', 'Handle ice candidate without peerConnection', { peerId });
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const core = this;
    this.peerConnections[peerId]!.onconnectionstatechange = (e) => {
      const { currentTarget }: { currentTarget: RTCPeerConnection } = e as any;
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
    const peerConnection = this.peerConnections[peerId];
    this.peerConnections[peerId]!.onicecandidate = function handleICECandidateEvent(
      event: RTCPeerConnectionIceEvent
    ) {
      if (event.candidate) {
        log('info', '* Outgoing ICE candidate:', {
          roomId,
          userId,
          target,
          connId,
          c: event.candidate,
          d: Object.keys(core.peerConnections),
          cs: peerConnection?.connectionState,
          ics: peerConnection?.iceConnectionState,
          ss: peerConnection?.signalingState,
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
    this.peerConnections[peerId]!.ontrack = (e) => {
      const stream = e.streams[0];
      log('info', 'On add remote stream', {
        target,
        streamId: stream.id,
        tracks: stream.getTracks(),
      });
      if (target.toString() !== '0') {
        this.onAddTrack[this.getPeerId(roomId, target, connId)](target, stream);
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
    const peerId = this.getPeerId(id, target, connId);
    if (!this.peerConnections[peerId]) {
      log('warn', 'Set media without peer connection', { peerId });
      return;
    }
    if (!this.localStream) {
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
      this.onAddTrack[this.getPeerId(id, target, connId)](userId, this.localStream);
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
    const peerId = this.getPeerId(id, target, connId);
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
    const peerId = this.getPeerId(id, target, connId);
    if (!this.peerConnections[peerId]) {
      log('warn', 'Handle offer message without peer connection', { peerId });
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
                this.ws.sendMessage({
                  id,
                  type: MessageType.ANSWER,
                  data: {
                    sdp: localDescription,
                    userId: this.ws.userId,
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
    const peerId = this.getPeerId(userId, target, connId);
    log('info', '----> Call recipient has accepted our call', {
      id,
      userId,
      target,
      peerId,
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
  public closeVideoCall: RTCInterface['closeVideoCall'] = ({ roomId, target, connId }) => {
    const peerId = this.getPeerId(roomId, target, connId);
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
