import { RTCInterface, MessageType } from '../types/interfaces';
import { log, compareNumbers } from '../utils/lib';
import { MEDIA_CONSTRAINTS } from '../utils/constants';
import WS from './ws';

class RTC implements RTCInterface {
  public peerConnections: RTCInterface['peerConnections'] = {};

  private ws: WS;

  private localStream: MediaStream | null = null;

  public room: number | null = null;

  constructor({ ws }: { ws: WS }) {
    this.ws = ws;
  }

  public createRTC: RTCInterface['createRTC'] = ({ id, item }) => {
    // TODO new connection with item
    this.peerConnections[compareNumbers(id, item || 0)] = new RTCPeerConnection({
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
    targetUserId,
    userId,
    item,
  }) => {
    const peerId = compareNumbers(targetUserId, item || 0);
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const core = this;
    this.peerConnections[peerId].onicecandidate = function handleICECandidateEvent(
      event: RTCPeerConnectionIceEvent
    ) {
      if (event.candidate) {
        log('info', '* Outgoing ICE candidate:', { targetUserId, userId, item });
        core.ws.sendMessage({
          type: MessageType.CANDIDATE,
          id: targetUserId,
          data: {
            candidate: event.candidate,
            userId: core.ws.userId,
            item,
          },
        });
      }
    };
    this.peerConnections[peerId].oniceconnectionstatechange =
      function handleICEConnectionStateChangeEvent(event: Event) {
        log(
          'info',
          '!!! ICE connection state changed to:',
          core.peerConnections[peerId].iceConnectionState
        );
        switch (core.peerConnections[peerId].iceConnectionState) {
          case 'closed':
          case 'failed':
          case 'disconnected':
            core.closeVideoCall({ targetUserId, item });
            break;
        }
      };
    this.peerConnections[peerId].onicegatheringstatechange =
      function handleICEGatheringStateChangeEvent(ev: Event) {
        log(
          'info',
          '*** ICE gathering state changed to:',
          core.peerConnections[peerId].iceGatheringState
        );
      };
    this.peerConnections[peerId].onsignalingstatechange = function handleSignalingStateChangeEvent(
      ev: Event
    ) {
      log(
        'info',
        '! WebRTC signaling state changed to:',
        core.peerConnections[peerId].signalingState
      );
      switch (core.peerConnections[peerId].signalingState) {
        case 'closed':
          core.closeVideoCall({ targetUserId, item });
          break;
      }
    };
    this.peerConnections[peerId].onnegotiationneeded = function handleNegotiationNeededEvent() {
      log('info', '--> Creating offer', { targetUserId, userId, item });
      core.peerConnections[peerId]
        .createOffer()
        .then((offer): 1 | void | PromiseLike<void> => {
          if (!core.peerConnections[peerId]) {
            log(
              'warn',
              'Can not set local description because peerConnection is',
              core.peerConnections[peerId]
            );
            return 1;
          }
          return core.peerConnections[peerId].setLocalDescription(offer).catch((err) => {
            log('error', 'Error create local description', err);
          });
        })
        .then(() => {
          const { localDescription } = core.peerConnections[peerId];
          if (localDescription) {
            log('info', '---> Sending offer to remote peer', { targetUserId, userId, item });
            core.ws.sendMessage({
              id: targetUserId,
              type: MessageType.OFFER,
              data: {
                sdp: localDescription,
                userId,
                item,
              },
            });
          }
        });
    };
    this.peerConnections[peerId].ontrack = (e) => {
      const stream = e.streams[0];
      log('info', 'On add remote stream', {
        targetUserId: item || targetUserId,
        streamId: stream.id,
      });
      this.onAddTrack(item || targetUserId, stream);
    };
  };

  public invite({
    targetUserId,
    userId,
    item,
  }: {
    targetUserId: number;
    userId: number;
    item?: number;
  }) {
    const peerId = compareNumbers(targetUserId, item || 0);
    this.handleIceCandidate({ targetUserId, userId, item });
    if (!this.localStream) {
      navigator.mediaDevices
        .getUserMedia(MEDIA_CONSTRAINTS)
        .then((localStream) => {
          this.localStream = localStream;
          log('info', '> Adding tracks to new local media stream', {
            streamId: localStream.id,
          });
          localStream.getTracks().forEach((track) => {
            this.peerConnections[peerId].addTrack(track, localStream);
          });
          this.onAddTrack(userId, localStream);
        })
        .catch((err) => {
          log('error', 'Error get self user media', err);
        });
    } else {
      log('info', '> Adding tracks to current local media stream', {
        streamId: this.localStream.id,
      });
      this.localStream.getTracks().forEach((track) => {
        if (this.localStream) {
          this.peerConnections[peerId].addTrack(track, this.localStream);
        }
      });
      this.onAddTrack(userId, this.localStream);
    }
  }

  // eslint-disable-next-line class-methods-use-this
  public onAddTrack: RTCInterface['onAddTrack'] = () => {
    /** */
  };

  /**
   * handleNewICECandidateMsg
   */
  public handleCandidateMessage: RTCInterface['handleCandidateMessage'] = (msg, cb) => {
    const {
      id,
      data: { candidate, item },
    } = msg;
    const peerId = compareNumbers(id, item || 0);
    const cand = new RTCIceCandidate(candidate);
    this.peerConnections[peerId]
      .addIceCandidate(cand)
      .then(() => {
        log('info', '< Adding received ICE candidate:', { id, item });
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

  private getRoom() {
    this.room = parseInt(window.location.pathname.replace('/', '').replace(/\?.*$/, ''), 10);
    return this.room;
  }

  public handleOfferMessage: RTCInterface['handleOfferMessage'] = (msg, cb) => {
    const {
      id,
      data: { sdp, userId, item },
    } = msg;
    const peerId = compareNumbers(id, item || 0);
    if (!sdp) {
      log('warn', 'Message offer error because sdp is:', sdp);
      if (cb) {
        cb(null);
      }
      return;
    }
    this.room = this.getRoom();
    this.handleIceCandidate({
      targetUserId: id,
      userId,
      item,
    });
    const desc = new RTCSessionDescription(sdp);
    this.peerConnections[peerId]
      .setRemoteDescription(desc)
      .then(() => {
        log('info', '<- Creating answer', { id, userId, item });
        this.peerConnections[peerId].createAnswer().then((answ) => {
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
          log('info', '------> Setting local description after creating answer');
          this.peerConnections[peerId]
            .setLocalDescription(answ)
            .catch((err) => {
              log('error', 'Error set local description for answer', err);
            })
            .then(() => {
              const { localDescription } = this.peerConnections[id];
              if (localDescription) {
                log('info', 'Sending answer packet back to other peer', { userId, item, id });
                this.ws.sendMessage({
                  id,
                  type: MessageType.ANSWER,
                  data: {
                    sdp: localDescription,
                    userId: this.ws.userId,
                    item,
                  },
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
        log('error', 'Failed get user media', e);
        if (cb) {
          cb(null);
        }
      });
  };

  public handleVideoAnswerMsg: RTCInterface['handleVideoAnswerMsg'] = (msg, cb) => {
    const {
      id,
      data: { sdp, userId, item },
    } = msg;
    const peerId = compareNumbers(userId, item || 0);
    log('info', '<-- Call recipient has accepted our call', { id, userId, item });
    const desc = new RTCSessionDescription(sdp);
    this.peerConnections[peerId]
      .setRemoteDescription(desc)
      .then(() => {
        if (cb) {
          cb(0);
        }
      })
      .catch((e) => {
        log('error', 'Error set description for answer:', e);
        if (cb) {
          cb(1);
        }
      });
  };

  public closeVideoCall: RTCInterface['closeVideoCall'] = ({ targetUserId, item }) => {
    log('info', '| Closing the call', { targetUserId, item });
    const peerId = compareNumbers(targetUserId, item || 0);
    this.peerConnections[peerId].onicecandidate = null;
    this.peerConnections[peerId].oniceconnectionstatechange = null;
    this.peerConnections[peerId].onicegatheringstatechange = null;
    this.peerConnections[peerId].onsignalingstatechange = null;
    this.peerConnections[peerId].onnegotiationneeded = null;
    this.peerConnections[peerId].ontrack = null;
    this.peerConnections[peerId].close();
  };
}

export default RTC;
