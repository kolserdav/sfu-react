import wrtc from '../../node-webrtc/lib/index';
import { RTCInterface, MessageType, SendMessageArgs } from '../types/interfaces';
import { log } from '../utils/lib';
import { SERVER_PORT } from '../utils/constants';
import WS from './ws';

class RTC implements RTCInterface {
  public peerConnections: RTCInterface['peerConnections'] = {};
  public readonly delimiter = '_';
  public rooms: Record<string, (string | number)[]> = {};
  public roomCons: Record<string, number | string> = {};
  private ws: WS;
  private streams: Record<number | string, MediaStream> = {};

  public onAddTrack: RTCInterface['onAddTrack'] = () => {
    /** */
  };

  constructor({ ws }: { ws: WS }) {
    this.ws = ws;
  }

  public getComparedString(id: number | string, userId: number | string, target: number | string) {
    return `${id}${this.delimiter}${userId}${this.delimiter}${target || 0}`;
  }

  public createRTC: RTCInterface['createRTC'] = ({ roomId, userId, target }) => {
    const peerId = this.getComparedString(roomId, userId, target);
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

  public handleIceCandidate: RTCInterface['handleIceCandidate'] = ({ roomId, userId, target }) => {
    const peerId = this.getComparedString(roomId, userId, target);
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const core = this;
    this.peerConnections[peerId].onicecandidate = function handleICECandidateEvent(
      event: RTCPeerConnectionIceEvent
    ) {
      if (event.candidate) {
        log('log', '* Outgoing ICE candidate:', { roomId, userId, target });
        core.ws.sendMessage({
          type: MessageType.CANDIDATE,
          id: roomId,
          data: {
            candidate: event.candidate,
            userId,
            target: 0,
          },
        });
      }
    };
    const { ws, rooms, delimiter } = this;
    this.peerConnections[peerId].oniceconnectionstatechange =
      function handleICEConnectionStateChangeEvent(event: Event) {
        log(
          'log',
          `* ICE connection state changed to: ${core.peerConnections[peerId].iceConnectionState}`,
          { peerId }
        );
        if (core.peerConnections[peerId].iceConnectionState === 'connected') {
          // Send to all users list of room's guest
          const isRoom = peerId.split(delimiter)[2] === '0';
          if (isRoom) {
            rooms[roomId].forEach((id) => {
              ws.sendMessage({
                type: MessageType.SET_CHANGE_ROOM_GUESTS,
                id,
                data: {
                  roomUsers: rooms[roomId],
                },
              });
            });
          }
        }
      };
    this.peerConnections[peerId].onicegatheringstatechange =
      function handleICEGatheringStateChangeEvent(ev: Event) {
        log(
          'log',
          `*** ICE gathering state changed to: ${core.peerConnections[peerId].iceGatheringState}`,
          { peerId }
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
    };
    this.peerConnections[peerId].onnegotiationneeded = function handleNegotiationNeededEvent() {
      log('info', '--> Creating offer', { roomId, userId, target });
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
            log('info', '---> Sending offer to remote peer', { roomId, userId, target });
            core.ws.sendMessage({
              id: roomId,
              type: MessageType.OFFER,
              data: {
                sdp: localDescription,
                userId,
                target: 0,
              },
            });
          }
        });
    };
    this.peerConnections[peerId].ontrack = (e) => {
      const stream = e.streams[0];
      this.streams[userId] = stream;
      this.onAddTrack(userId, stream);
    };
  };

  public handleCandidateMessage: RTCInterface['handleCandidateMessage'] = (msg, cb) => {
    const {
      id,
      data: { candidate, userId, target },
    } = msg;
    const peerId = this.getComparedString(id, userId, target);
    const cand = new wrtc.RTCIceCandidate(candidate);
    if (cand.candidate) {
      this.peerConnections[peerId]
        .addIceCandidate(cand)
        .then(() => {
          log('log', '!! Adding received ICE candidate:', { userId, id, target });
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

  public addUserToRoom({ userId, roomId }: { userId: number | string; roomId: number | string }) {
    if (!this.rooms[roomId]) {
      this.rooms[roomId] = [userId];
    } else if (this.rooms[roomId].indexOf(userId) === -1) {
      this.rooms[roomId].push(userId);
    }
  }

  public handleOfferMessage: RTCInterface['handleOfferMessage'] = (msg, cb) => {
    const {
      id,
      data: { sdp, userId, target },
    } = msg;
    if (!sdp) {
      log('warn', 'Message offer error because sdp is:', sdp);
      if (cb) {
        cb(null);
      }
      return;
    }
    // If user call to other guest via new connection with room
    if (target) {
      this.createRTC({
        roomId: id,
        userId,
        target,
      });
    }
    const peerId = this.getComparedString(id, userId, target);
    this.handleIceCandidate({
      roomId: id,
      userId,
      target,
    });
    const desc = new wrtc.RTCSessionDescription(sdp);
    this.peerConnections[peerId]
      .setRemoteDescription(desc)
      .then(() => {
        log('info', '-> Local video stream obtained', { peerId });
        // If a user creates a new connection with a room to get another user's stream
        if (target) {
          this.streams[target].getTracks().forEach((track) => {
            this.peerConnections[peerId].addTrack(track, this.streams[target]);
          });
        }
      })
      .then(() => {
        log('info', '--> Creating answer', { id, userId, target });
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
          log('info', '---> Setting local description after creating answer');
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
                    target,
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
      data: { sdp, userId, target },
    } = msg;
    // TODO maybe wrong
    const peerId = this.getComparedString(userId, id, target);
    log('info', '----> Call recipient has accepted our call', { userId, target });
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
    this.createRTC({ roomId: id, userId: uid, target: 0 });
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
      conn.onmessage = (mess) => {
        const msg = this.ws.parseMessage(mess.data as string);
        if (msg) {
          const { type } = msg;
          switch (type) {
            case MessageType.OFFER:
              this.handleOfferMessage(msg);
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

  public closeVideoCall: RTCInterface['closeVideoCall'] = ({ roomId, userId, target }) => {
    const peerId = this.getComparedString(roomId, userId, target);
    delete this.streams[userId];
    log('info', '| Closing the call', { peerId });
    this.peerConnections[peerId].onicecandidate = null;
    this.peerConnections[peerId].oniceconnectionstatechange = null;
    this.peerConnections[peerId].onicegatheringstatechange = null;
    this.peerConnections[peerId].onsignalingstatechange = null;
    this.peerConnections[peerId].onnegotiationneeded = null;
    this.peerConnections[peerId].ontrack = null;
    this.peerConnections[peerId].close();
    delete this.peerConnections[peerId];
  };
}

export default RTC;
