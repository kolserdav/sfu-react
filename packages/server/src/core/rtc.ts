import wrtc from '../../node-webrtc/lib/index';
import { RTCInterface, MessageType, SendMessageArgs } from '../types/interfaces';
import { log } from '../utils/lib';
import { MEDIA_CONSTRAINTS } from '../utils/constants';
import WS from './ws';

class RTC implements RTCInterface {
  public peerConnection: RTCPeerConnection;
  public rooms: number[] = [];
  private ws: WS;

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
    if (!this.peerConnection) {
      log('warn', 'Failed handle ice candidate because peerConnection is', this.peerConnection);
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const core = this;
    this.peerConnection.onicecandidate = function handleICECandidateEvent(
      event: RTCPeerConnectionIceEvent
    ) {
      if (event.candidate) {
        log('info', `Outgoing ICE candidate: ${event.candidate.candidate}`);
        core.ws.sendMessage({
          type: MessageType.CANDIDATE,
          id: targetUserId,
          token: '',
          data: {
            candidate: event.candidate,
            userId,
          },
        });
      }
    };
    this.peerConnection.oniceconnectionstatechange = function handleICEConnectionStateChangeEvent(
      event: Event
    ): 1 | 0 {
      if (core.peerConnection) {
        log('info', `ICE connection state changed to ${core.peerConnection.iceConnectionState}`);
        switch (core.peerConnection.iceConnectionState) {
          case 'closed':
          case 'failed':
          case 'disconnected':
            core.closeVideoCall();
            break;
        }
        return 0;
      }
      log('warn', 'Can not change state of ice peer connection that is', core.peerConnection);
      return 1;
    };
    this.peerConnection.onicegatheringstatechange = function handleICEGatheringStateChangeEvent(
      ev: Event
    ): 1 | 0 {
      if (core.peerConnection) {
        log('info', `*** ICE gathering state changed to: ${core.peerConnection.iceGatheringState}`);
        return 0;
      }
      log(
        'warn',
        'Handle ICE fathering state is wrong because peerConnection is',
        core.peerConnection
      );
      return 1;
    };
    this.peerConnection.onsignalingstatechange = function handleSignalingStateChangeEvent(
      ev: Event
    ): 1 | 0 {
      if (core.peerConnection) {
        log('info', `WebRTC signaling state changed to: ${core.peerConnection.signalingState}`);
        switch (core.peerConnection.signalingState) {
          case 'closed':
            core.closeVideoCall();
            break;
        }
        return 0;
      }
      log(
        'warn',
        'Can not handle signaling state chage event because peerConnections is',
        core.peerConnection
      );
      return 1;
    };
    this.peerConnection.onnegotiationneeded = function handleNegotiationNeededEvent() {
      if (core.peerConnection) {
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
            if (core.peerConnection) {
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
                return 0;
              }
              log('warn', 'Local description is', localDescription);
            } else {
              log('warn', 'Peer connection is', core.peerConnection);
            }
            log('error', 'Local description not set');
            return 1;
          });
      } else {
        log('warn', 'Offer can not created that peerConnection is', core.peerConnection);
      }
    };
    this.peerConnection.ontrack = (e) => {
      log('info', 'onTrack', e);
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
    if (!this.peerConnection) {
      log('warn', 'Failed create ice candidate because peerConnection is', this.peerConnection);
      if (cb) {
        cb(null);
      }
      return;
    }
    const cand = new wrtc.RTCIceCandidate(candidate);
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
    if (!this.peerConnection) {
      log('warn', 'Failed create answer:', { peerConnection: this.peerConnection });
      cb(null);
      return;
    }
    console.log(userId, this.rooms, 444444444444444);
    this.handleIceCandidate({
      targetUserId: userId,
      userId: this.rooms[0],
    });
    const desc = new wrtc.RTCSessionDescription(sdp);
    this.peerConnection
      .setRemoteDescription(desc)
      .then(() => {
        log('info', 'Setting up the local media stream...');
        return wrtc.mediaDevices.getUserMedia(MEDIA_CONSTRAINTS);
      })
      .then((stream) => {
        const localStream: MediaStream = stream;
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
        if (!this.peerConnection) {
          log('warn', 'Failed create answer because peerConnection is', this.peerConnection);
          return;
        }
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
              if (this.peerConnection) {
                const { localDescription } = this.peerConnection;
                if (localDescription) {
                  log('info', 'Sending answer packet back to other peer');
                  this.ws.sendMessage({
                    id,
                    type: MessageType.ANSWER,
                    token: '',
                    data: {
                      sdp: localDescription,
                      userId: this.rooms[1],
                    },
                  });
                  cb(localDescription);
                } else {
                  log('warn', 'Failed send answer because localDescription is', localDescription);
                }
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
    if (this.peerConnection) {
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
    } else {
      log('warn', 'Answer description mot set because peerConnection is', this.peerConnection);
      cb(1);
    }
  }

  private closeVideoCall(): 0 | 1 {
    if (this.peerConnection) {
      log('info', 'Closing the call');
      this.peerConnection.onicecandidate = null;
      this.peerConnection.oniceconnectionstatechange = null;
      this.peerConnection.onicegatheringstatechange = null;
      this.peerConnection.onsignalingstatechange = null;
      this.peerConnection.onnegotiationneeded = null;
      this.peerConnection.ontrack = null;
      this.peerConnection.close();
      // this.peerConnection = null;
      return 0;
    }
    log('warn', 'Peer connection cant close that is', this.peerConnection);
    return 1;
  }
}

export default RTC;
