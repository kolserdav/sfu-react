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
import 'webrtc-adapter';
import { RTCInterface, MessageType } from '../types/interfaces';
import { getCodec, log } from '../utils/lib';
import WS from './ws';

class RTC implements Omit<RTCInterface, 'peerConnectionsServer' | 'createRTCServer'> {
  public peerConnections: RTCInterface['peerConnections'] = {};

  public readonly delimiter = '_';

  public roomLength = 0;

  public connId = '';

  public muteds: string[] = [];

  public localTrackSettings: MediaTrackSettings | null = null;

  // eslint-disable-next-line class-methods-use-this
  public lostStreamHandler: (args: {
    target: number | string;
    connId: string;
    eventName: string;
  }) => void = () => {
    /** */
  };

  private ws: WS;

  public localStream: MediaStream | null = null;

  public roomId: number | null = null;

  // eslint-disable-next-line class-methods-use-this
  public onAddTrack: Record<string, (target: number | string, stream: MediaStream) => void> = {};

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
    if (this.peerConnections[peerId]) {
      this.closeVideoCall({ target, userId, roomId, connId });
    }
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
    this.handleIceCandidate({ connId, roomId, userId, target });
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
    const peerId = this.getPeerId(roomId, target, connId);
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
            eventName: 'disconnected-peer',
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
                mimeType: getCodec(),
              },
              connId,
            });
          }
        });
    };
    let s1 = 0;
    const stream = new MediaStream();
    this.peerConnections[peerId]!.ontrack = (e) => {
      const _stream = e.streams[0];
      stream.addTrack(_stream.getTracks()[0]);
      const tracks = stream.getTracks();
      log('info', 'On add remote stream', {
        target,
        peerId,
        s1,
        streamId: stream.id,
        tracks,
      });
      if (target.toString() !== '0' && (s1 === 1 || tracks.length >= 2)) {
        this.onAddTrack[this.getPeerId(roomId, target, connId)](target, stream);
      }
      s1++;
    };
  };

  public addTracks: RTCInterface['addTracks'] = ({ roomId, userId, target, connId }, cb) => {
    const peerId = this.getPeerId(roomId, target, connId);
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
            cb(0, localStream);
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
                cb(0, videoStream);
              })
              .catch((e) => {
                log('error', 'Error get display media', e);
                cb(1, new MediaStream());
              });
          }
        })
        .catch((err) => {
          log('error', 'Error get self user media', err);
          cb(1, new MediaStream());
        });
    } else {
      log('info', '> Adding tracks to current local media stream', {
        streamId: this.localStream.id,
      });
      this.localStream.getTracks().forEach((track) => {
        if (this.localStream) {
          this.peerConnections[peerId]!.addTrack(track, this.localStream);
        }
      });
      cb(0, this.localStream);
    }
  };

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

  // eslint-disable-next-line class-methods-use-this
  public handleOfferMessage: RTCInterface['handleOfferMessage'] = (msg) => {
    log('warn', 'Handle offer message not implemented', msg);
  };

  public handleVideoAnswerMsg: RTCInterface['handleVideoAnswerMsg'] = async (msg, cb) => {
    const {
      id,
      connId,
      data: { sdp, userId, target },
    } = msg;
    const peerId = this.getPeerId(userId, target, connId);
    const opts = {
      id,
      userId,
      target,
      peerId,
      s: this.peerConnections[peerId]?.connectionState,
      is: this.peerConnections[peerId]?.iceConnectionState,
    };
    log('info', '----> Call recipient has accepted our call', opts);
    const desc = new RTCSessionDescription(sdp);
    if (!this.peerConnections[peerId]) {
      log('warn', 'Skiping set remote desc for answer', opts);
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
          ...opts,
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
