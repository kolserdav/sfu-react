import wrtc from '../../node-webrtc/lib/index';
import { RTCInterface, MessageType } from '../types/interfaces';
import { log, compareNumbers } from '../utils/lib';
import WS from './ws';

class RTC implements RTCInterface {
  public peerConnections: Record<number, RTCPeerConnection> = {};
  public rooms: Record<string, number[]> = {};
  public roomCons: Record<string, number> = {};
  private ws: WS;
  private streams: Record<number, MediaStream> = {};
  constructor({ ws }: { ws: WS }) {
    this.ws = ws;
  }

  public createRTC: RTCInterface['createRTC'] = ({ id, item }) => {
    this.peerConnections[compareNumbers(id, item || 0)] = new wrtc.RTCPeerConnection({
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
          id: userId,
          token: '',
          data: {
            candidate: event.candidate,
            userId: targetUserId,
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
              token: '',
              data: {
                sdp: localDescription,
                userId,
              },
            });
          }
        });
    };
    this.peerConnections[peerId].ontrack = (e) => {
      log('warn', 'stssssssssssss', { peerId });
      this.streams[peerId] = e.streams[0];
      log('info', 'onTrack', e.streams);
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
  }
  public handleCandidateMessage: RTCInterface['handleCandidateMessage'] = (msg, cb) => {
    const {
      id,
      data: { candidate, userId, item },
    } = msg;
    const peerId = compareNumbers(id, item || 0);
    const cand = new wrtc.RTCIceCandidate(candidate);
    if (cand.candidate) {
      this.peerConnections[peerId]
        .addIceCandidate(cand)
        .then(() => {
          log('info', 'Adding received ICE candidate:', { userId, id, item });
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
  };

  public addUserToRoom({ userId, roomId }: { userId: number; roomId: number }) {
    if (this.rooms[roomId].indexOf(userId) === -1) {
      this.rooms[roomId].push(userId);
    }
  }

  public handleOfferMessage: RTCInterface['handleOfferMessage'] = (msg, cb) => {
    const {
      id,
      data: { sdp, userId, item },
    } = msg;
    if (!sdp) {
      log('warn', 'Message offer error because sdp is:', sdp);
      if (cb) {
        cb(null);
      }
      return;
    }
    const peerId = compareNumbers(id, item || 0);
    this.handleIceCandidate({
      targetUserId: id,
      userId: id,
      item,
    });
    const desc = new wrtc.RTCSessionDescription(sdp);
    this.peerConnections[peerId]
      .setRemoteDescription(desc)
      .then(() => {
        log('info', '-- Local video stream obtained', item);
        if (item) {
          this.streams[peerId].getTracks().forEach((track) => {
            this.peerConnections[peerId].addTrack(track, this.streams[peerId]);
          });
        }
      })
      .then(() => {
        log('info', '<- Creating answer');
        this.peerConnections[peerId].createAnswer().then((answ) => {
          if (!answ) {
            log('error', 'Failed set local description for answer.', {
              answ,
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
              const { localDescription } = this.peerConnections[peerId];
              if (localDescription) {
                log('info', 'Sending answer packet back to other peer', { userId, item, id });
                this.ws.sendMessage({
                  id: userId,
                  type: MessageType.ANSWER,
                  token: '',
                  data: {
                    sdp: localDescription,
                    userId: id,
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
      data: { sdp, userId, item },
    } = msg;
    const peerId = compareNumbers(userId, item || 0);
    log('info', '<-- Call recipient has accepted our call', { userId, item });
    const desc = new wrtc.RTCSessionDescription(sdp);
    this.peerConnections[peerId]
      .setRemoteDescription(desc)
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

  public closeVideoCall: RTCInterface['closeVideoCall'] = ({ targetUserId, item }) => {
    log('info', '| Closing the call');
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
