import { RTCInterface, MessageType, SendMessageArgs } from '../types/interfaces';
import { log } from '../utils/lib';
import { MEDIA_CONSTRAINTS } from '../utils/constants';
import WS from './ws';

class RTC implements RTCInterface {
  public peerConnection: RTCPeerConnection;

  private ws: WS;

  public room: number | null = null;

  constructor({ roomId, ws }: { roomId: number; ws: WS }) {
    this.peerConnection = this.createRTC({ id: roomId });
    this.ws = ws;
  }

  public createRTC(args: { id: number }): RTCPeerConnection {
    this.peerConnection = new RTCPeerConnection({
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

  public handleIceCandidate({ targetUserId }: { targetUserId: number }) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const core = this;
    this.peerConnection.onicecandidate = function handleICECandidateEvent(
      event: RTCPeerConnectionIceEvent
    ) {
      // TODO fixed wrong address
      if (event.candidate) {
        log('info', `Outgoing ICE candidate: ${event.candidate.candidate}`);
        core.ws.sendMessage({
          type: MessageType.CANDIDATE,
          id: targetUserId,
          token: '',
          data: {
            candidate: event.candidate,
            userId: core.ws.userId,
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
                userId: core.ws.userId,
              },
            });
            // cb(localDescription);
          }
        });
    };
    this.peerConnection.ontrack = (e) => {
      this.onAddTrack(e);
    };
  }

  public invite({ targetUserId }: { targetUserId: number }) {
    this.handleIceCandidate({ targetUserId });
    navigator.mediaDevices
      .getUserMedia(MEDIA_CONSTRAINTS)
      .then((localStream) => {
        log('info', '-- Adding tracks to the RTCPeerConnection');
        localStream.getTracks().forEach((track) => {
          this.peerConnection.addTrack(track, localStream);
        });
      })
      .catch((err) => {
        log('error', 'Error get self user media', err);
      });
  }

  // eslint-disable-next-line class-methods-use-this
  public onAddTrack(e: RTCTrackEvent): void {
    /** */
  }

  /**
   * handleNewICECandidateMsg
   */
  public handleCandidateMessage(
    msg: SendMessageArgs<MessageType.CANDIDATE>,
    cb?: (cand: RTCIceCandidate | null) => any
  ) {
    const {
      data: { candidate },
    } = msg;
    const cand = new RTCIceCandidate(candidate);
    this.peerConnection
      .addIceCandidate(cand)
      .then(() => {
        log('info', `Adding received ICE candidate: ${JSON.stringify(cand)}`);
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

  private getRoom() {
    this.room = parseInt(window.location.pathname.replace('/', '').replace(/\?.*$/, ''), 10);
    return this.room;
  }

  public handleOfferMessage(
    msg: SendMessageArgs<MessageType.OFFER>,
    cb: (desc: RTCSessionDescription | null) => any
  ) {
    const {
      id,
      data: { sdp },
    } = msg;
    if (!sdp) {
      log('warn', 'Message offer error because sdp is:', sdp);
      cb(null);
      return;
    }
    this.room = this.getRoom();
    this.handleIceCandidate({
      targetUserId: this.room,
    });
    const desc = new RTCSessionDescription(sdp);
    this.peerConnection
      .setRemoteDescription(desc)
      .then(() => {
        log('info', 'Setting up the local media stream...');
        return navigator.mediaDevices.getUserMedia(MEDIA_CONSTRAINTS);
      })
      .then((stream) => {
        const localStream = stream;
        log('info', '-- Local video stream obtained');
        localStream.getTracks().forEach((track) => {
          if (!this.peerConnection) {
            log('warn', 'failed to add candidate video track');
          } else {
            this.peerConnection.addTrack(track, localStream);
          }
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
                  id,
                  type: MessageType.ANSWER,
                  token: '',
                  data: {
                    sdp: localDescription,
                    userId: this.ws.userId,
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
    const desc = new RTCSessionDescription(sdp);
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
