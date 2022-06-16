import wrtc from '../../node-webrtc/lib/index';
import { RTCInterface, MessageType, SendMessageArgs } from '../types/interfaces';
import { log, compareNumbers } from '../utils/lib';
import { SERVER_PORT } from '../utils/constants';
import WS from './ws';

class RTC implements RTCInterface {
  public peerConnections: RTCInterface['peerConnections'] = {};
  public rooms: Record<string, number[]> = {};
  public roomCons: Record<string, number> = {};
  private ws: WS;
  private streams: Record<number, MediaStream> = {};

  public onAddTrack: RTCInterface['onAddTrack'] = () => {
    /** */
  };

  constructor({ ws }: { ws: WS }) {
    this.ws = ws;
  }

  public createRTC: RTCInterface['createRTC'] = ({ id, userId, item }) => {
    const peerId = compareNumbers(id, userId || 0, item || 0);
    this.peerConnections[peerId] = new wrtc.RTCPeerConnection({
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
    const peerId = compareNumbers(targetUserId, userId, item || 0);
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
            userId,
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
            core.closeVideoCall({ targetUserId, userId, item });
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
              data: {
                sdp: localDescription,
                userId,
              },
            });
          }
        });
    };
    this.peerConnections[peerId].ontrack = (e) => {
      const targets = peerId.split('-');
      const target = parseInt(targets[2] === '0' ? targets[1] : targets[2], 10);
      const stream = e.streams[0];
      this.streams[target] = stream;
      this.onAddTrack(target, stream);
      log('info', 'On get remote stream', { peerId, streamId: stream.id });
    };
  };

  public handleCandidateMessage: RTCInterface['handleCandidateMessage'] = (msg, cb) => {
    const {
      id,
      data: { candidate, userId, item },
    } = msg;
    const peerId = compareNumbers(id, userId, item || 0);
    const cand = new wrtc.RTCIceCandidate(candidate);
    if (cand.candidate) {
      this.peerConnections[peerId]
        .addIceCandidate(cand)
        .then(() => {
          log('info', '< Adding received ICE candidate:', { userId, id, item });
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
    if (!this.rooms[roomId]) {
      this.rooms[roomId] = [userId];
    } else if (this.rooms[roomId].indexOf(userId) === -1) {
      this.rooms[roomId].push(userId);
    } else {
      log('warn', 'Duplicate adding user to room');
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
    const peerId = compareNumbers(id, userId, item || 0);
    this.handleIceCandidate({
      targetUserId: id,
      userId: userId,
      item,
    });
    const desc = new wrtc.RTCSessionDescription(sdp);
    this.peerConnections[peerId]
      .setRemoteDescription(desc)
      .then(() => {
        log('info', '-- Local video stream obtained', { peerId });
        if (!item) {
          const emptyStream: MediaStream = new wrtc.MediaStream();
          emptyStream.getTracks().forEach((track) => {
            this.peerConnections[peerId].addTrack(track, emptyStream);
          });
        } else {
          this.streams[userId].getTracks().forEach((track) => {
            this.peerConnections[peerId].addTrack(track, this.streams[item]);
          });
        }
      })
      .then(() => {
        log('info', '<- Creating answer', { id, userId, item });
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
                log('info', 'Sending answer packet back to other peer', {
                  peerId,
                });
                this.ws.sendMessage({
                  id: userId,
                  type: MessageType.ANSWER,
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
      id,
      data: { sdp, userId, item },
    } = msg;
    // TODO maybe wrong
    const peerId = compareNumbers(userId, id, item || 0);
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

  public handleGetRoomMessage({ message }: { message: SendMessageArgs<MessageType.GET_ROOM> }) {
    const {
      data: { userId: uid },
      id,
    } = message;
    // Room creatting counter local connection with every user
    const conn = new this.ws.websocket(`ws://localhost:${SERVER_PORT}`);
    this.addUserToRoom({
      roomId: id,
      userId: uid,
    });
    this.createRTC({ id, userId: uid, item: 0 });
    conn.onopen = () => {
      conn.send(
        JSON.stringify({
          type: MessageType.GET_USER_ID,
          id,
          data: {
            isRoom: true,
          },
        })
      );
      this.rooms[id].forEach((_item) => {
        if (_item !== uid) {
          this.ws.sendMessage({
            type: MessageType.SET_CHANGE_ROOM_GUESTS,
            id: _item,
            data: {
              roomUsers: this.rooms[id],
            },
          });
        }
      });
      let sendList = false;
      conn.onmessage = (mess) => {
        const msg = this.ws.parseMessage(mess.data as string);
        if (msg) {
          const { type } = msg;
          switch (type) {
            case MessageType.OFFER:
              // eslint-disable-next-line no-case-declarations
              const {
                data: { item, userId },
              } = this.ws.getMessage(MessageType.OFFER, msg);
              // If user call to other guest via new connection with room
              if (item) {
                this.createRTC({
                  id,
                  userId: this.ws.getMessage(MessageType.OFFER, msg).data.userId,
                  item,
                });
              }
              this.handleOfferMessage(msg, () => {
                // Send users list to new guest
                if (uid === userId && !sendList) {
                  sendList = true;
                  this.ws.sendMessage({
                    type: MessageType.SET_CHANGE_ROOM_GUESTS,
                    id: uid,
                    data: {
                      roomUsers: this.rooms[id],
                    },
                  });
                }
              });
              break;
            case MessageType.ANSWER:
              this.handleVideoAnswerMsg(msg);
              break;
            case MessageType.CANDIDATE:
              this.handleCandidateMessage(msg);
              break;
          }
        }
      };
    };
    this.ws.sendMessage({
      type: MessageType.SET_ROOM,
      id,
      data: undefined,
    });
  }

  public closeVideoCall: RTCInterface['closeVideoCall'] = ({ targetUserId, userId, item }) => {
    log('info', '| Closing the call', { targetUserId, userId, item });
    const peerId = compareNumbers(targetUserId, userId || 0, item || 0);
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
