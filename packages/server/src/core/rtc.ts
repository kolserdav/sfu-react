import wrtc from '../../node-webrtc/lib/index';
import { RTCInterface, MessageType, SendMessageArgs } from '../types/interfaces';
import { log } from '../utils/lib';
import { MEDIA_CONSTRAINTS } from '../utils/constants';
import WS from './ws';

class RTC implements RTCInterface {
  public peerConnection: RTCPeerConnection;
  public rooms: number[] = [];
  private ws: WS;
  private streams: Record<number, MediaStream> = {};
  constructor({ roomId, ws }: { roomId: number; ws: WS }) {
    this.peerConnection = this.createRTC({ id: roomId });
    this.ws = ws;
  }

  public createRTC(args: { id: number }): RTCPeerConnection {
    this.peerConnection = new wrtc.RTCPeerConnection({
      iceServers:
        process.env.NODE_ENV === 'production'
          ? [
              {
                urls: ['stun:stun.l.google.com:19302'],
              },
            ]
          : [],
    });
    return this.peerConnection;
  }

  public handleIceCandidate({ targetUserId, userId }: { targetUserId: number; userId: number }) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const core = this;
    this.peerConnection.onicecandidate = function handleICECandidateEvent(
      event: RTCPeerConnectionIceEvent
    ) {
      if (event.candidate) {
        log('info', 'Outgoing ICE candidate:', event.candidate.usernameFragment);
        core.ws.sendMessage({
          type: MessageType.CANDIDATE,
          id: userId,
          token: '',
          data: {
            candidate: event.candidate,
            userId: targetUserId,
          },
        });
      }
    };
    this.peerConnection.oniceconnectionstatechange = function handleICEConnectionStateChangeEvent(
      event: Event
    ) {
      log('info', `ICE connection state changed to ${core.peerConnection.iceConnectionState}`);
      switch (core.peerConnection.iceConnectionState) {
        case 'closed':
        case 'failed':
        case 'disconnected':
          core.closeVideoCall();
          break;
      }
    };
    this.peerConnection.onicegatheringstatechange = function handleICEGatheringStateChangeEvent(
      ev: Event
    ) {
      log('info', `*** ICE gathering state changed to: ${core.peerConnection.iceGatheringState}`);
    };
    this.peerConnection.onsignalingstatechange = function handleSignalingStateChangeEvent(
      ev: Event
    ) {
      log('info', `WebRTC signaling state changed to: ${core.peerConnection.signalingState}`);
      switch (core.peerConnection.signalingState) {
        case 'closed':
          core.closeVideoCall();
          break;
      }
    };
    this.peerConnection.onnegotiationneeded = function handleNegotiationNeededEvent() {
      log('info', '---> Creating offer');
      core.peerConnection
        .createOffer()
        .then((offer): 1 | void | PromiseLike<void> => {
          if (!core.peerConnection) {
            log(
              'warn',
              'Can not set local description because peerConnection is',
              core.peerConnection
            );
            return 1;
          }
          return core.peerConnection.setLocalDescription(offer).catch((err) => {
            log('error', 'Error create local description', err);
          });
        })
        .then(() => {
          const { localDescription } = core.peerConnection;
          if (localDescription) {
            log('info', '---> Sending offer to remote peer');
            core.ws.sendMessage({
              id: targetUserId,
              type: MessageType.OFFER,
              token: '',
              data: {
                sdp: localDescription,
                userId,
              },
            });
            // cb(localDescription);
          }
        });
    };
    this.peerConnection.ontrack = (e) => {
      this.streams[targetUserId] = e.streams[0];
      log('info', 'onTrack', e.streams);
    };
  }

  public invite({ targetUserId, userId }: { targetUserId: number; userId: number }) {
    this.handleIceCandidate({ targetUserId, userId });
  }
  public handleCandidateMessage(
    msg: SendMessageArgs<MessageType.CANDIDATE>,
    cb?: (cand: RTCIceCandidate | null) => any
  ) {
    const {
      data: { candidate },
    } = msg;
    const cand = new wrtc.RTCIceCandidate(candidate);
    if (cand.candidate) {
      this.peerConnection
        .addIceCandidate(cand)
        .then(() => {
          log('info', 'Adding received ICE candidate:', cand.usernameFragment);
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
    }
  }

  public handleOfferMessage(
    msg: SendMessageArgs<MessageType.OFFER>,
    cb: (desc: RTCSessionDescription | null) => any
  ) {
    const {
      id,
      data: { sdp, userId },
    } = msg;
    if (!sdp) {
      log('warn', 'Message offer error because sdp is:', sdp);
      cb(null);
      return;
    }
    this.handleIceCandidate({
      targetUserId: userId,
      userId: this.rooms[0],
    });
    const desc = new wrtc.RTCSessionDescription(sdp);
    this.peerConnection
      .setRemoteDescription(desc)
      .then(() => {
        log('info', '-- Local video stream obtained');
        this.streams[userId].getTracks().forEach((track) => {
          this.peerConnection.addTrack(track, this.streams[userId]);
        });
      })
      .then(() => {
        log('info', '------> Creating answer');
        this.peerConnection.createAnswer().then((answ) => {
          if (!answ || !this.peerConnection) {
            log('error', 'Failed set local description for answer.', {
              answ,
              peerConnection: this.peerConnection,
            });
            cb(null);
            return;
          }
          log('info', '------> Setting local description after creating answer');
          this.peerConnection
            .setLocalDescription(answ)
            .catch((err) => {
              log('error', 'Error set local description for answer', err);
            })
            .then(() => {
              const { localDescription } = this.peerConnection;
              if (localDescription) {
                log('info', 'Sending answer packet back to other peer');
                this.ws.sendMessage({
                  id: userId,
                  type: MessageType.ANSWER,
                  token: '',
                  data: {
                    sdp: localDescription,
                    userId: id,
                  },
                });
                cb(localDescription);
              } else {
                log('warn', 'Failed send answer because localDescription is', localDescription);
              }
            });
        });
      })
      .catch((e) => {
        log('error', 'Failed get user media', e);
        cb(null);
      });
  }

  public handleVideoAnswerMsg(msg: SendMessageArgs<MessageType.ANSWER>, cb: (res: 1 | 0) => any) {
    const {
      data: { sdp },
    } = msg;
    log('info', 'Call recipient has accepted our call');
    const desc = new wrtc.RTCSessionDescription(sdp);
    this.peerConnection
      .setRemoteDescription(desc)
      .then(() => {
        cb(0);
      })
      .catch((e) => {
        log('error', 'Error set description for answer', e);
        cb(1);
      });
  }

  private closeVideoCall() {
    log('info', 'Closing the call');
    this.peerConnection.onicecandidate = null;
    this.peerConnection.oniceconnectionstatechange = null;
    this.peerConnection.onicegatheringstatechange = null;
    this.peerConnection.onsignalingstatechange = null;
    this.peerConnection.onnegotiationneeded = null;
    this.peerConnection.ontrack = null;
    this.peerConnection.close();
  }
}

export default RTC;
