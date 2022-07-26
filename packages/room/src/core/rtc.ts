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
import { RTCInterface, MessageType, SendMessageArgs, AddTracksProps } from '../types/interfaces';
import { log } from '../utils/lib';
import WS from './ws';

class RTC implements RTCInterface {
  public peerConnections: RTCInterface['peerConnections'] = {};

  public readonly delimiter = '_';

  public users: (string | number)[] = [];

  public muteds: string[] = [];

  private ws: WS;

  public streams: Record<string, MediaStream> = {};

  constructor({ ws }: { ws: WS }) {
    this.ws = ws;
  }

  public getPeerId(userId: number | string, target: number | string, connId: string) {
    return `${userId}${this.delimiter}${target || 0}${this.delimiter}${connId}`;
  }

  public createRTC: RTCInterface['createRTC'] = ({ roomId, userId, target, connId }) => {
    const peerId = this.getPeerId(userId, target, connId);
    const uidStr = userId.toString();
    const targetStr = target.toString();
    // Clean peer connection
    Object.keys(this.peerConnections).forEach((item) => {
      const peer = item.split(this.delimiter);
      if (peer[0] === uidStr && peer[1] === targetStr) {
        this.closeVideoCall({
          roomId,
          target: targetStr,
          userId: uidStr,
          connId: peer[2],
        });
      } else if (peer[0] === targetStr && peer[1] === uidStr) {
        this.closeVideoCall({
          roomId,
          target: uidStr,
          userId: targetStr,
          connId: peer[2],
        });
      }
    });
    if (target.toString() === '0') {
      Object.keys(this.streams).forEach((item) => {
        const peer = item.split(this.delimiter);
        if (peer[0] === userId) {
          const _peerId = this.getPeerId(userId, 0, peer[2]);
          delete this.streams[_peerId];
        }
      });
    }
    this.peerConnections[peerId] = new RTCPeerConnection({
      iceServers: [
        {
          urls: [process.env.REACT_APP_STUN_SERVER as string],
        },
        {
          urls: [process.env.REACT_APP_TURN_SERVER as string],
          username: process.env.REACT_APP_TURN_SERVER_USER,
          credential: process.env.REACT_APP_TURN_SERVER_PASSWORD,
        },
      ],
      iceTransportPolicy: 'all',
    });

    return this.peerConnections;
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
    const peerId = this.getPeerId(userId, target, connId);
    if (!this.peerConnections[peerId]) {
      log('warn', 'Handle ice candidate without peerConnection', { peerId });
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const core = this;
    const { ws, delimiter } = this;
    this.peerConnections[peerId]!.onconnectionstatechange = (e) => {
      const { currentTarget }: { currentTarget: RTCPeerConnection } = e as any;
      switch (currentTarget.connectionState) {
        case 'closed':
        case 'disconnected':
        case 'failed':
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

    let s = 1;
    this.peerConnections[peerId]!.ontrack = (e) => {
      const isRoom = this.checkIsRoom({ peerId });
      const stream = e.streams[0];
      const isNew = stream.id !== this.streams[peerId]?.id;
      log('info', 'ontrack', {
        peerId,
        isRoom,
        si: stream.id,
        isNew,
        userId,
        target,
        tracks: stream.getTracks().map((item) => item.kind),
        s,
      });
      if (isNew) {
        if (isRoom) {
          this.streams[peerId] = stream;
          setTimeout(() => {
            this.users.forEach((id) => {
              ws.sendMessage({
                type: MessageType.SET_CHANGE_UNIT,
                id,
                data: {
                  target: userId,
                  eventName: 'add',
                  roomLenght: this.users.length,
                  muteds: this.muteds,
                },
                connId,
              });
            });
          }, 0);
        } else {
          const tracksOpts: AddTracksProps = {
            peerId,
            roomId,
            userId,
            target,
            connId,
          };
          log('info', 'Add tracks', { tracksOpts, s });
          this.addTracks(tracksOpts, () => {
            /** */
          });
        }
      }
      s++;
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
  };

  protected checkIsRoom({ peerId }: { peerId: string }) {
    const peer = peerId.split(this.delimiter);
    return peer[1] === '0';
  }

  public handleCandidateMessage: RTCInterface['handleCandidateMessage'] = async (msg, cb) => {
    const {
      id,
      connId,
      data: { candidate, userId, target },
    } = msg;
    let peerId = this.getPeerId(userId, target, connId);
    let _connId = connId;
    if (!this.peerConnections?.[peerId]) {
      const peer = Object.keys(this.peerConnections).find((p) => {
        const pe = p.split(this.delimiter);
        return pe[0] === userId.toString() && pe[1] === target.toString();
      });
      _connId = peer?.split(this.delimiter)[3] || connId;
      peerId = this.getPeerId(userId, target, _connId);
    }
    const cand = new RTCIceCandidate(candidate as RTCIceCandidate);

    log('log', 'Trying to add ice candidate:', {
      peerId,
      d: Object.keys(this.peerConnections).length,
      connId,
      id,
      userId,
      target,
    });
    if (this.peerConnections[peerId]?.connectionState === 'new') {
      await new Promise((resolve) => {
        const t = setInterval(() => {
          if (this.peerConnections[peerId]?.connectionState !== 'new') {
            clearInterval(t);
            resolve(0);
          }
        }, 500);
      });
    }
    if (!this.peerConnections[peerId]) {
      log('info', 'Skiping add ice candidate', {
        connId,
        id,
        userId,
        peerId,
        target,
        state: this.peerConnections[peerId]?.connectionState,
        ice: this.peerConnections[peerId]?.iceConnectionState,
        ss: this.peerConnections[peerId]?.signalingState,
        k: Object.keys(this.peerConnections),
      });
      return;
    }
    if (cand.candidate === '') {
      return;
    }
    if (cand?.usernameFragment) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      cand!.usernameFragment = null;
    }
    this.peerConnections[peerId]!.addIceCandidate(cand)
      .then(() => {
        log('info', '!! Adding received ICE candidate:', {
          userId,
          id,
          target,
          uFrag: cand?.usernameFragment,
        });
        if (cb) {
          cb(cand as RTCIceCandidate);
        }
      })
      .catch((e) => {
        log('error', 'Set ice candidate error', {
          error: e,
          connId,
          peerId,
          id,
          userId,
          target,
          uFrag: cand?.usernameFragment,
          state: this.peerConnections[peerId]?.connectionState,
          ice: this.peerConnections[peerId]?.iceConnectionState,
          ss: this.peerConnections[peerId]?.signalingState,
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
    const peerId = this.getPeerId(userId, target, connId);

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
    const desc = new RTCSessionDescription(sdp);
    this.peerConnections[peerId]!.setRemoteDescription(desc)
      .then(() => {
        log('info', '-> Local video stream obtained', { peerId });
      })
      .then(() => {
        log('info', '--> Creating answer', {
          peerId,
          ss: this.peerConnections[peerId]?.signalingState,
        });
        this.peerConnections[peerId]!.createAnswer().then((answ) => {
          if (!answ) {
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
          let _peerId = peerId;
          if (!this.peerConnections[peerId]) {
            _peerId = this.getPeerId(target, userId, connId);
          }
          if (!this.peerConnections[_peerId]) {
            log('warn', 'Skip set local description fo answer', {
              roomId: id,
              userId,
              target,
              connId,
              k: Object.keys(this.peerConnections).length,
              s: Object.keys(this.streams).length,
            });
            return;
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
                  cb(null);
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
          desc: desc !== undefined,
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
    const peerId = this.getPeerId(id, target, connId);
    log('info', '----> Call recipient has accepted our call', {
      id,
      userId,
      target,
      peerId,
      s: this.peerConnections[peerId]?.connectionState,
      is: this.peerConnections[peerId]?.iceConnectionState,
    });
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
    const desc = new RTCSessionDescription(sdp);
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

  public addTracks: RTCInterface['addTracks'] = ({ roomId, connId, userId, peerId, target }) => {
    let _connId = connId;
    const keysStreams = Object.keys(this.streams);
    keysStreams.forEach((element) => {
      const str = element.split(this.delimiter);
      if (str[0] === target.toString() && str[1] === '0') {
        // eslint-disable-next-line prefer-destructuring
        _connId = str[2];
      }
    });
    const _peerId = this.getPeerId(target, 0, _connId);
    const tracks = this.streams[_peerId]?.getTracks();
    if (!this.streams[_peerId]) {
      log('warn', 'Skiping add track', {
        roomId,
        userId,
        target,
        connId,
        _peerId,
        _connId,
        k: Object.keys(this.streams),
      });
      return;
    }
    log('warn', 'Add tracks', {
      roomId,
      userId,
      target,
      connId,
      _peerId,
      tracksL: tracks?.length,
      _connId,
      id: this.streams[_peerId]?.id,
      tracks: tracks?.map((item) => item.kind),
      ss: Object.keys(this.streams),
    });
    tracks.forEach((track) => {
      if (this.peerConnections[peerId]) {
        const sender = this.peerConnections[peerId]!.getSenders().find(
          (item) => item.track?.kind === track.kind
        );
        if (sender && sender?.track?.id === track.id) {
          this.peerConnections[peerId]?.removeTrack(sender);
        }
        this.peerConnections[peerId]!.addTrack(track, this.streams[_peerId]);
      }
    });
  };

  public closeVideoCall: RTCInterface['closeVideoCall'] = ({ roomId, userId, target, connId }) => {
    const peerId = this.getPeerId(userId, target, connId);
    delete this.streams[peerId];
    if (!this.peerConnections[peerId]) {
      log('warn', 'Close video call without peer connection', { peerId });
      return;
    }
    log('info', '| Closing the call', {
      peerId,
      k: Object.keys(this.peerConnections).length,
      s: Object.keys(this.streams).length,
    });
    if (this.peerConnections[peerId]) {
      this.peerConnections[peerId]!.onicecandidate = null;
      this.peerConnections[peerId]!.onsignalingstatechange = null;
      this.peerConnections[peerId]!.onnegotiationneeded = null;
      this.peerConnections[peerId]!.ontrack = null;
      this.peerConnections[peerId]!.close();
      delete this.peerConnections[peerId];
    }
  };

  // eslint-disable-next-line class-methods-use-this
  public onClosedCall: RTCInterface['onClosedCall'] = (args) => {
    log('info', 'Call is closed', { ...args });
  };

  // FIXME
  public cleanConnections(roomId: string, userId: string, connId: string) {
    const peerKeys = Object.keys(this.peerConnections);
    log('warn', 'Clean peer connections 1', {
      peerKeys,
      userId,
      connId,
    });
    peerKeys.forEach((item) => {
      const peer = item.split(this.delimiter);
      if (peer[0] === userId.toString()) {
        this.closeVideoCall({
          roomId,
          userId,
          target: peer[1],
          connId: peer[2],
        });
      } else if (peer[1] === userId.toString()) {
        this.closeVideoCall({
          roomId,
          userId: peer[0],
          target: userId,
          connId: peer[2],
        });
      }
    });
  }

  public onOpen({ id }: { id: string | number }) {
    this.ws.sendMessage({
      type: MessageType.GET_USER_ID,
      id,
      data: {
        isRoom: true,
      },
      connId: '',
    });
  }

  public setChangeUnitHandler({
    id,
    connId,
    data: { target, eventName },
  }: SendMessageArgs<MessageType.SET_CHANGE_UNIT>) {
    const keys = Object.keys(this.peerConnections);
    let _connId = connId;
    const targetStr = target.toString();
    this.users.forEach((_item) => {
      keys.forEach((i) => {
        const peer = i.split(this.delimiter);
        if (
          ((peer[0] === _item || peer[0] === id) && peer[1] === targetStr) ||
          (peer[0] === targetStr && (peer[1] === _item || peer[1] === targetStr))
        ) {
          // eslint-disable-next-line prefer-destructuring
          _connId = peer[3];
        }
      });
    });
    // TODO
  }
}

export default RTC;
