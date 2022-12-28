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
import 'webrtc-adapter';
import { RTCInterface, MessageType, Locale } from '../types/interfaces';
import { IS_DEV } from '../utils/constants';
import { getCodec, log } from '../utils/lib';
import WS from './ws';

class RTC
  implements
    Omit<
      RTCInterface,
      'peerConnectionsServer' | 'createRTCServer' | 'handleOfferMessage' | 'addTracksServer'
    >
{
  public peerConnections: RTCInterface['peerConnections'] = {};

  public readonly delimiter = '_';

  public roomLength = 0;

  public connId = '';

  public muteds: (string | number)[] = [];

  public localTrackSettings: MediaTrackSettings | null = null;

  public checkAddeds: (string | number)[] = [];

  // eslint-disable-next-line class-methods-use-this
  public lostStreamHandler: (args: {
    target: number | string;
    roomId: string | number;
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

  public setLocalStream(stream: MediaStream | null) {
    this.localStream = stream;
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
      log('warn', 'Duplicate peer connection', {
        peerId,
        eventName,
        checkAddeds: this.checkAddeds,
        peers: IS_DEV ? this.getPeerKeys() : undefined,
      });
      this.closeVideoCall({ target, userId, roomId, connId, eventName: 'duplicate-peer' });
    } else {
      log('info', 'Creating peer connection', { peerId });
    }
    this.createRTC({ roomId, target, userId, connId, iceServers });
    this.onAddTrack[peerId] = (addedUserId, stream) => {
      log('info', 'On track peer', {
        s: stream,
        userId,
        target,
        addedUserId,
        connId,
        eventName,
        tracks: stream.getTracks(),
      });
      onTrack({ addedUserId, stream, connId });
    };
    this.handleIceCandidate({ connId, roomId, userId, target });
    return 0;
  }

  public getPeerKeys() {
    return Object.keys(this.peerConnections || {});
  }

  public setCheckAddeds(id: number | string) {
    if (this.checkAddeds.indexOf(id) === -1) {
      this.checkAddeds.push(id);
    } else {
      log('warn', 'Duplicate check addeds', { id, checkAddeds: this.checkAddeds });
    }
  }

  public removeCheckAddeds(id: string | number) {
    const index = this.checkAddeds.indexOf(id);
    if (index !== -1) {
      this.checkAddeds.splice(index, 1);
    } else {
      log('warn', 'Check addeds is missing', { id, checkAddeds: this.checkAddeds });
    }
  }

  public checkCheckAddeds(id: string | number) {
    return this.checkAddeds.indexOf(id) !== -1;
  }

  public createRTC: RTCInterface['createRTC'] = ({ connId, roomId, target, iceServers = [] }) => {
    if (!connId) {
      log('warn', 'Connection id is: ', { connId });
    }
    this.peerConnections[this.getPeerId(roomId, target, connId)] = new RTCPeerConnection({
      iceServers: process.env.CI === 'true' ? [] : iceServers,
    });
    return this.peerConnections;
  };

  public getPeerId(roomId: number | string, target: number | string, connId: string) {
    return `${roomId}${this.delimiter}${target || 0}${this.delimiter}${connId}`;
  }

  public sendNeedReconnect(userId: string | number) {
    this.getPeerKeys().forEach((item) => {
      const peer = item.split(this.delimiter);
      if (peer[1] !== '0') {
        this.ws.sendMessage({
          type: MessageType.GET_NEED_RECONNECT,
          id: peer[1],
          connId: peer[2],
          data: {
            userId,
          },
        });
      }
    });
  }

  public checkPeerConnection({ target }: { target: string | number }) {
    return Object.keys(this.peerConnections).find((item) => {
      const peer = item.split(this.delimiter);
      return peer[1] === target.toString();
    });
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
    log('info', 'Handle ice candidate', { roomId, userId, target, connId });
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const core = this;
    let s1 = 0;
    const stream = new MediaStream();
    this.peerConnections[peerId]!.ontrack = (e) => {
      const _stream = e.streams[0];
      stream.addTrack(_stream.getTracks()[0]);
      const tracks = stream.getTracks();
      log('log', 'On add remote stream', {
        active: stream.active,
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
    this.peerConnections[peerId]!.onconnectionstatechange = (e) => {
      const { currentTarget }: { currentTarget: RTCPeerConnection } = e as any;
      switch (currentTarget.connectionState) {
        case 'closed':
        case 'disconnected':
        case 'failed':
          this.lostStreamHandler({
            target,
            connId,
            eventName: 'disconnected-peer',
            roomId,
          });
          break;
        default:
      }
    };
    const peerConnection = this.peerConnections[peerId];
    this.peerConnections[peerId]!.onicecandidate = function handleICECandidateEvent(
      event: RTCPeerConnectionIceEvent
    ) {
      if (event.candidate) {
        log('log', '* Outgoing ICE candidate:', {
          roomId,
          userId,
          target,
          connId,
          c: event.candidate,
          d: IS_DEV ? core.getPeerKeys() : undefined,
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
            roomId,
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
            core.onClosedCall({ roomId, userId, target, connId, command: 'iceConnectionState' });
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
        log('info', '! WebRTC signaling state changed', {
          signalingState: core.peerConnections[peerId]!.signalingState,
          peerId,
        });
        switch (core.peerConnections[peerId]!.signalingState) {
          case 'closed':
            core.onClosedCall({ roomId, userId, target, connId, command: 'signalingState' });
            break;
        }
      };
    this.peerConnections[peerId]!.onnegotiationneeded =
      async function handleNegotiationNeededEvent() {
        if (!core.peerConnections[peerId]) {
          log('warn', 'On negotiation needed without peer connection', { peerId });
          return;
        }
        log('info', '--> On negotiation needed', {
          roomId,
          userId,
          target,
          state: core.peerConnections[peerId]!.signalingState,
          cs: core.peerConnections[peerId]!.connectionState,
          is: core.peerConnections[peerId]!.iceConnectionState,
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
                  roomId,
                },
                connId,
              });
            }
          });
      };
  };

  // eslint-disable-next-line class-methods-use-this
  private async checkMediaDevice(kind: 'video' | 'audio') {
    const cV = navigator.mediaDevices.getUserMedia({ [kind]: true });
    return new Promise<boolean>((resolve) => {
      cV.then((d) => {
        resolve(true);
      }).catch((e) => {
        log('error', 'Error get user media', { [kind]: e });
        resolve(false);
      });
    });
  }

  public async getTracks({ locale }: { locale: Locale.Client }): Promise<null | MediaStream> {
    if (this.localStream) {
      return this.localStream;
    }
    const video = await this.checkMediaDevice('video');
    if (!video) {
      log('warn', locale.videoDeviceRequired, {}, true, true);
      return null;
    }
    const audio = await this.checkMediaDevice('audio');
    if (!audio) {
      log('warn', locale.audioDeviceRequired, {}, true, true);
      return null;
    }
    const localStream = await navigator.mediaDevices
      .getUserMedia({
        video: true,
        audio: true,
      })
      .catch((err) => {
        log('error', locale?.errorGetCamera || 'Error get self user media', err, true);
        return null;
      });
    if (!localStream) {
      return null;
    }
    this.localStream = localStream;
    if (!this.ws.shareScreen) {
      return this.localStream;
    }
    const videoStream = await navigator.mediaDevices.getDisplayMedia({ video: true }).catch((e) => {
      if (e.name === 'NotAllowedError') {
        log('warn', locale?.getDisplayCancelled || 'Get display cancelled', e, true);
      } else {
        log('error', locale?.errorGetDisplay || 'Error get display media', e, true);
      }
      return null;
    });
    if (!videoStream) {
      return null;
    }
    const audioSrc = this.localStream.getTracks().find((item) => item.kind === 'audio');
    if (audioSrc) {
      videoStream.addTrack(audioSrc);
      this.localStream = videoStream;
    } else {
      log('warn', locale?.erorGetSound || 'Share screen without sound', audio, true);
      return null;
    }
    return this.localStream;
  }

  public addTracks: RTCInterface['addTracks'] = async ({ roomId, stream, target, connId }, cb) => {
    const peerId = this.getPeerId(roomId, target, connId);
    if (!this.peerConnections[peerId]) {
      log('warn', 'Set media without peer connection', { peerId });
      cb(1);
      return;
    }
    log('info', '> Adding tracks to local media stream', {
      streamId: stream.id,
    });
    let error: 0 | 1 = 0;
    stream.getTracks().every((track) => {
      if (!this.peerConnections[peerId]) {
        log('error', 'Unexpected missing peer connection', { peerId });
        error = 1;
        return false;
      }
      const sender = this.peerConnections[peerId]!.getSenders().find(
        (item) => item.track?.kind === track.kind
      );
      if (sender) {
        this.peerConnections[peerId]!.removeTrack(sender);
      }
      if (this.localStream) {
        this.peerConnections[peerId]!.addTrack(track, stream);
      }
      return true;
    });
    cb(error);
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
      log('warn', 'Handle candidate without peer connection', { peerId });
      return;
    }
    const cand = new RTCIceCandidate(candidate);
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
    if (
      !this.peerConnections[peerId] ||
      this.peerConnections[peerId]?.signalingState === 'stable'
    ) {
      log('info', 'Skiping set remote desc for answer', opts);
      return;
    }
    this.peerConnections[peerId]!.setRemoteDescription(desc)
      .then(() => {
        if (cb) {
          cb(0);
        }
      })
      .catch((e) => {
        log('error', `Error set description for answer: ${e.message}`, {
          ...opts,
        });
        if (cb) {
          cb(1);
        }
      });
  };

  // eslint-disable-next-line class-methods-use-this
  public closeVideoCall: RTCInterface['closeVideoCall'] = ({
    roomId,
    target,
    connId,
    eventName,
  }) => {
    log('info', 'Close video call', { roomId, target, connId, eventName });
    const peerId = this.getPeerId(roomId, target, connId);
    this.closeByPeer(peerId, eventName);
  };

  public closeByPeer = (peerId: string, eventName: string) => {
    if (!this.peerConnections[peerId]) {
      log('warn', 'Close video call without peer connection', {
        peers: IS_DEV ? this.getPeerKeys() : undefined,
        peerId,
        eventName,
      });
      return;
    }
    log('info', '| Closing the call', { peerId, k: IS_DEV ? this.getPeerKeys() : undefined });
    this.peerConnections[peerId]!.onicecandidate = null;
    this.peerConnections[peerId]!.onconnectionstatechange = null;
    this.peerConnections[peerId]!.oniceconnectionstatechange = null;
    this.peerConnections[peerId]!.onicegatheringstatechange = null;
    this.peerConnections[peerId]!.onsignalingstatechange = null;
    this.peerConnections[peerId]!.onnegotiationneeded = null;
    this.peerConnections[peerId]!.ontrack = null;
    this.peerConnections[peerId]!.getSenders().forEach((item) => {
      this.peerConnections[peerId]!.removeTrack(item);
    });
    this.peerConnections[peerId]!.close();
    delete this.peerConnections[peerId];
    delete this.onAddTrack[peerId];
  };

  // eslint-disable-next-line class-methods-use-this
  public onClosedCall: RTCInterface['onClosedCall'] = (args) => {
    log('warn', 'Call is closed', { ...args, peers: IS_DEV ? this.getPeerKeys() : undefined });
    const { target } = args;
    if (target.toString() === '0') {
      // const { href } = window.location
      // window.location.href = href;
    }
  };

  public closeAllConnections(withSelfStream = false) {
    this.ws.connection.close();
    this.getPeerKeys().forEach((item) => {
      this.closeByPeer(item, 'close-all');
    });
    if (withSelfStream && this.localStream !== null) {
      this.localStream.getTracks().forEach((track) => {
        track.stop();
      });
    }
    this.localStream = null;
  }

  public parsePeerId({ target }: { target: string | number }) {
    let peer: string[] = [];
    this.getPeerKeys().every((item) => {
      const _peer = item.split(this.delimiter);
      if (_peer[1] === target.toString()) {
        peer = _peer;
        return false;
      }
      return true;
    });
    return peer;
  }
}

export default RTC;
