import wrtc from '../../node-webrtc/lib/index';
import { RTCInterface, MessageType, SendMessageArgs } from '../types/interfaces';
import { log } from '../utils/lib';
import WS from './ws';

class RTC implements RTCInterface {
  public peerConnections: Record<number, RTCPeerConnection> = {};
  public rooms: Record<number, number[]> = {};
  private ws: WS;
  private streams: Record<number, MediaStream> = {};
  constructor({ ws }: { ws: WS }) {
    this.ws = ws;
  }

  public createRTC({ id }: { id: number }) {
    this.peerConnections[id] = new wrtc.RTCPeerConnection({
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
  }

  public handleIceCandidate: RTCInterface['handleIceCandidate'] = ({ targetUserId, userId }) => {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const core = this;
    this.peerConnections[userId].onicecandidate = function handleICECandidateEvent(
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
    this.peerConnections[userId].oniceconnectionstatechange =
      function handleICEConnectionStateChangeEvent(event: Event) {
        log(
          'info',
          'ICE connection state changed to:',
          core.peerConnections[userId].iceConnectionState
        );
        switch (core.peerConnections[userId].iceConnectionState) {
          case 'closed':
          case 'failed':
          case 'disconnected':
            core.closeVideoCall({ userId });
            break;
        }
      };
    this.peerConnections[userId].onicegatheringstatechange =
      function handleICEGatheringStateChangeEvent(ev: Event) {
        log(
          'info',
          `*** ICE gathering state changed to: ${core.peerConnections[userId].iceGatheringState}`
        );
      };
    this.peerConnections[userId].onsignalingstatechange = function handleSignalingStateChangeEvent(
      ev: Event
    ) {
      log(
        'info',
        `WebRTC signaling state changed to: ${core.peerConnections[userId].signalingState}`
      );
      switch (core.peerConnections[userId].signalingState) {
        case 'closed':
          core.closeVideoCall({ userId });
          break;
      }
    };
    this.peerConnections[userId].onnegotiationneeded = function handleNegotiationNeededEvent() {
      log('info', '---> Creating offer');
      core.peerConnections[userId]
        .createOffer()
        .then((offer): 1 | void | PromiseLike<void> => {
          return core.peerConnections[userId].setLocalDescription(offer).catch((err) => {
            log('error', 'Error create local description', err);
          });
        })
        .then(() => {
          const { localDescription } = core.peerConnections[userId];
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
    this.peerConnections[userId].ontrack = (e) => {
      this.streams[targetUserId] = e.streams[0];
      log('info', 'onTrack', e.streams);
    };
  };

  public invite({ targetUserId, userId }: { targetUserId: number; userId: number }) {
    this.handleIceCandidate({ targetUserId, userId });
  }
  public handleCandidateMessage(
    msg: SendMessageArgs<MessageType.CANDIDATE>,
    cb?: (cand: RTCIceCandidate | null) => any
  ) {
    const {
      data: { candidate, userId },
    } = msg;
    const cand = new wrtc.RTCIceCandidate(candidate);
    if (cand.candidate) {
      this.peerConnections[userId]
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

  public addUserToRoom({ userId, roomId }: { userId: number; roomId: number }) {
    if (this.rooms[roomId].indexOf(userId) === -1) {
      this.rooms[roomId].push(userId);
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
    console.log(this.rooms);
    this.handleIceCandidate({
      targetUserId: userId,
      userId: id,
    });
    const desc = new wrtc.RTCSessionDescription(sdp);
    this.peerConnections[userId]
      .setRemoteDescription(desc)
      .then(() => {
        log('info', '-- Local video stream obtained');
        this.streams[userId].getTracks().forEach((track) => {
          this.peerConnections[userId].addTrack(track, this.streams[userId]);
        });
      })
      .then(() => {
        log('info', '------> Creating answer');
        this.peerConnections[userId].createAnswer().then((answ) => {
          if (!answ) {
            log('error', 'Failed set local description for answer.', {
              answ,
            });
            cb(null);
            return;
          }
          log('info', '------> Setting local description after creating answer');
          this.peerConnections[userId]
            .setLocalDescription(answ)
            .catch((err) => {
              log('error', 'Error set local description for answer', err);
            })
            .then(() => {
              const { localDescription } = this.peerConnections[userId];
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
      data: { sdp, userId },
    } = msg;
    log('info', 'Call recipient has accepted our call');
    const desc = new wrtc.RTCSessionDescription(sdp);
    this.peerConnections[userId]
      .setRemoteDescription(desc)
      .then(() => {
        cb(0);
      })
      .catch((e) => {
        log('error', 'Error set description for answer', e);
        cb(1);
      });
  }

  private closeVideoCall({ userId }: { userId: number }) {
    log('info', 'Closing the call');
    this.peerConnections[userId].onicecandidate = null;
    this.peerConnections[userId].oniceconnectionstatechange = null;
    this.peerConnections[userId].onicegatheringstatechange = null;
    this.peerConnections[userId].onsignalingstatechange = null;
    this.peerConnections[userId].onnegotiationneeded = null;
    this.peerConnections[userId].ontrack = null;
    this.peerConnections[userId].close();
  }
}

export default RTC;
