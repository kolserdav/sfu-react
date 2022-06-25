/******************************************************************************************
 * Repository: https://github.com/kolserdav/uyem.git
 * File name: Room.hooks.tsx
 * Author: Sergey Kolmiller
 * Email: <uyem.ru@gmail.com>
 * License: BSD-2-Clause
 * License text: Binary distributions of this software include 'wrtc' and other third-party libraries.
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Tue Jun 21 2022 08:49:55 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/
/* eslint-disable no-case-declarations */
import { useEffect, useState, useMemo, useCallback } from 'react';
import WS from '../core/ws';
import RTC from '../core/rtc';
import { log } from '../utils/lib';
import { getWidthOfItem } from './Room.lib';
import { MessageType, SendMessageArgs } from '../types/interfaces';
import { Stream } from '../types';
import s from './Room.module.scss';
import c from './ui/CloseButton.module.scss';
import storeStreams, { changeStreams } from '../store/streams';

// eslint-disable-next-line import/prefer-default-export
export const useConnection = ({
  id,
  roomId,
}: {
  id: number | string;
  roomId: number | string | null;
}) => {
  const [streams, setStreams] = useState<Stream[]>([]);
  const [shareScreen, setShareScreen] = useState<boolean>(false);
  const [localShareScreen, setLocalShareScreen] = useState<boolean>(false);
  const [selfStream, setSelfStream] = useState<Stream | null>(null);
  const [roomIsSaved, setRoomIsSaved] = useState<boolean>(false);
  const [lenght, setLenght] = useState<number>(streams.length);
  const [connectionId, setConnectionId] = useState<string>('');
  const ws = useMemo(() => new WS({ shareScreen: localShareScreen }), [localShareScreen]);
  const rtc = useMemo(() => new RTC({ ws }), [ws]);
  const screenShare = useMemo(
    () => (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      setShareScreen(!shareScreen);
    },
    []
  );

  const lostStreamHandler = ({
    target,
    connId,
    video,
  }: {
    target: number | string;
    connId: string;
    video: HTMLVideoElement;
  }) => {
    if (!roomId) {
      return;
    }
    const peerId = rtc.getPeerId(roomId, target, connId);
    if (!rtc.peerConnections[peerId]) {
      log('info', 'Lost stream handler without peer connection', { peerId });
      return;
    }
    rtc.closeVideoCall({ roomId, userId: ws.userId, target, connId });
    const _stream = streams.find((item) => item.target === target);
    if (_stream) {
      storeStreams.dispatch(changeStreams({ type: 'delete', stream: _stream }));
    }
  };

  /**
   * Change media source
   */
  useEffect(() => {
    if (!roomId) {
      return;
    }
    if (localShareScreen !== shareScreen) {
      if (selfStream) {
        rtc.localStream = null;
        rtc.closeAllConnections();
        ws.connection.close();
        setLocalShareScreen(shareScreen);
        setRoomIsSaved(false);
        storeStreams.dispatch(changeStreams({ type: 'clean', stream: selfStream }));
        setLenght(0);
        setSelfStream(null);
      } else {
        log('warn', 'Change media source. Self stream is:', selfStream);
      }
    }
  }, [shareScreen, localShareScreen, roomId, rtc, ws, selfStream]);

  /**
   * Set streams from store
   */
  useEffect(() => {
    const cleanSubs = storeStreams.subscribe(() => {
      const state = storeStreams.getState();
      setStreams(state.streams);
    });
    return () => {
      cleanSubs();
    };
  }, []);

  /**
   * Connections handlers
   */
  useEffect(() => {
    if (!roomId) {
      return () => {
        /** */
      };
    }
    if (!ws.userId) {
      ws.setUserId(id);
    }
    const addStream = ({
      target,
      stream,
      connId,
      change = false,
    }: {
      target: string | number;
      stream: MediaStream;
      connId: string;
      change?: boolean;
    }) => {
      const _stream: Stream = {
        target,
        stream,
        connId,
        ref: (node) => {
          if (node) {
            // eslint-disable-next-line no-param-reassign
            node.srcObject = stream;
          }
        },
      };
      storeStreams.dispatch(changeStreams({ type: 'add', stream: _stream, change }));
      if (!selfStream && target === ws.userId) {
        setSelfStream(_stream);
      }
      log('info', 'Add stream', { _stream });
    };

    const changeRoomUnitHandler = ({
      id: userId,
      data: { target, eventName, roomLenght },
      connId,
    }: SendMessageArgs<MessageType.SET_CHANGE_UNIT>) => {
      if (lenght !== roomLenght) {
        setLenght(roomLenght);
      }
      //alert(`${eventName} ${target}`);
      switch (eventName) {
        case 'add':
        case 'added':
          if (userId !== target) {
            log('info', 'Change room unit handler', {
              userId,
              target,
              roomLenght,
              connId,
              eventName,
            });
            rtc.createPeerConnection(
              {
                roomId,
                target,
                userId: id,
                connId,
                onTrack: ({ addedUserId, stream }) => {
                  log('warn', 'Added unit track', { addedUserId, s: stream.id, connId });
                  addStream({ target: addedUserId, stream, connId });
                },
              },
              (e) => {
                if (!e) {
                  if (eventName !== 'added' && target !== userId) {
                    ws.sendMessage({
                      type: MessageType.SET_CHANGE_UNIT,
                      id: target,
                      connId,
                      data: {
                        target: userId,
                        roomLenght,
                        eventName: 'added',
                      },
                    });
                  }
                }
              }
            );
          }
          break;
        case 'delete':
          log('info', 'Need delete user', {
            roomId,
            target,
            userId,
            connId,
            k: Object.keys(rtc.peerConnections),
          });
          rtc.closeVideoCall({ roomId, target, userId, connId });
          const _stream = streams.find((item) => item.target === target);
          if (_stream) {
            storeStreams.dispatch(changeStreams({ type: 'delete', stream: _stream }));
          }
          break;
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const changeRoomGuestsHandler = ({ rawMessage }: { rawMessage: SendMessageArgs<any> }) => {
      if (!roomId) {
        return;
      }
      const {
        data: { roomUsers },
        connId,
      } = ws.getMessage(MessageType.SET_ROOM_GUESTS, rawMessage);
      const _streams: Stream[] = storeStreams.getState().streams as Stream[];
      log('info', 'onChangeRoomGuests', { roomUsers, id, st: _streams.map((i) => i.target) });
      // Add remote streams
      setLenght(roomUsers.length);
      roomUsers.forEach((item) => {
        if (item !== id) {
          const peerId = rtc.getPeerId(roomId, item, connId);
          const _isExists = _streams.filter((_item) => item === _item.target);
          if (!_isExists[0]) {
            log('warn', 'Check new user', { item });
            rtc.createPeerConnection(
              {
                roomId,
                target: item,
                userId: id,
                connId,
                onTrack: ({ addedUserId, stream }) => {
                  addStream({ target: addedUserId, stream, connId });
                },
              },
              (e) => {
                log('warn', 'Change room guests connection', {
                  roomId,
                  target: item,
                  userId: id,
                  connId,
                });
              }
            );
          } else if (rtc.peerConnections[peerId]) {
            const { connectionState } = rtc.peerConnections[peerId]!;
            switch (connectionState) {
              case 'closed':
              case 'failed':
              case 'disconnected':
                log('warn', 'Unclosed connection', {
                  peerId,
                  d: rtc.peerConnections[peerId]!.connectionState,
                });
                break;
            }
          }
        } else if (!streams.find((_item) => _item.target === ws.userId)) {
          const __streams = streams.map((_item) => _item);
          if (selfStream) {
            storeStreams.dispatch(changeStreams({ type: 'add', stream: selfStream }));
          } else {
            log('warn', 'Self stream is not defined', { __streams });
          }
        }
      });
      // Remove disconnected
      streams.forEach((item) => {
        const isExists = roomUsers.filter((_item) => _item === item.target);
        if (!isExists[0]) {
          Object.keys(rtc.peerConnections).forEach((__item) => {
            const peer = __item.split(rtc.delimiter);
            if (peer[1] === item.target) {
              streams.forEach((i, index) => {
                if (i.target === item.target) {
                  storeStreams.dispatch(changeStreams({ type: 'delete', stream: i }));
                }
              });
              rtc.closeVideoCall({
                roomId,
                userId: id,
                target: item.target,
                connId: peer[2],
              });
            }
          });
        }
        return isExists[0] !== undefined;
      });
    };
    ws.onOpen = () => {
      ws.sendMessage({
        type: MessageType.GET_USER_ID,
        id,
        data: {},
        connId: '',
      });
    };
    ws.onMessage = (ev) => {
      const { data } = ev;
      const rawMessage = ws.parseMessage(data);
      if (!rawMessage) {
        return;
      }
      const { type, connId } = rawMessage;
      switch (type) {
        case MessageType.SET_USER_ID:
          setConnectionId(connId);
          rtc.createPeerConnection(
            {
              userId: ws.userId,
              target: 0,
              connId,
              roomId,
              onTrack: ({ addedUserId, stream }) => {
                log('warn', '-> Added local stream to room', { addedUserId, id });
                addStream({ target: addedUserId, stream, connId });
              },
            },
            (e) => {
              if (!e) {
                ws.sendMessage({
                  type: MessageType.GET_ROOM,
                  id: roomId,
                  data: {
                    userId: id,
                  },
                  connId,
                });
              }
            }
          );
          break;
        case MessageType.OFFER:
          rtc.handleOfferMessage(rawMessage);
          break;
        case MessageType.CANDIDATE:
          rtc.handleCandidateMessage(rawMessage);
          break;
        case MessageType.SET_ROOM_GUESTS:
          changeRoomGuestsHandler({ rawMessage });
          break;
        case MessageType.ANSWER:
          rtc.handleVideoAnswerMsg(rawMessage);
          break;
        case MessageType.SET_ROOM:
          setRoomIsSaved(true);
          break;
        case MessageType.SET_CHANGE_UNIT:
          changeRoomUnitHandler(ws.getMessage(MessageType.SET_CHANGE_UNIT, rawMessage));
          break;
        case MessageType.SET_ERROR:
          const {
            data: { message },
          } = ws.getMessage(MessageType.SET_ERROR, rawMessage);
          log('warn', 'error', message);
          break;
        default:
      }
    };
    return () => {
      ws.onOpen = () => {
        /** */
      };
      ws.onMessage = () => {
        /** */
      };
    };
  }, [roomId, streams, ws, rtc, id, roomIsSaved, lenght, selfStream]);

  /**
   * Check room list
   */
  useEffect(() => {
    if (!roomId) {
      return () => {
        //
      };
    }
    let interval = setTimeout(() => {
      //
    });
    let _streams: Stream[] = storeStreams.getState().streams as Stream[];
    if (_streams.length !== streams.length && !shareScreen) {
      interval = setInterval(() => {
        _streams = storeStreams.getState().streams as Stream[];
        if (_streams.length !== streams.length) {
          ws.sendMessage({
            type: MessageType.GET_ROOM_GUESTS,
            id,
            connId: connectionId,
            data: {
              roomId,
            },
          });
        }
      }, 10000);
    }
    return () => {
      clearTimeout(interval);
    };
  }, [roomId, ws, lenght, streams, connectionId, id, shareScreen]);

  return { streams, lenght, lostStreamHandler, screenShare };
};

export const useVideoDimensions = ({
  lenght,
  container,
}: {
  lenght: number;
  container: HTMLDivElement | null;
}) => {
  let time = 0;
  return useCallback(
    (e: React.SyntheticEvent<HTMLVideoElement, Event>, stream: MediaStream) => {
      time++;
      if (time % 5 === 0) {
        requestAnimationFrame(() => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { target }: { target: HTMLVideoElement } = e as any;
          const _container =
            target.getAttribute('data') !== 'full'
              ? container
              : (target.parentElement as HTMLDivElement);
          if (_container) {
            const { videoHeight, videoWidth } = target;
            const coeff = videoWidth / videoHeight;
            const { width, cols, rows } = getWidthOfItem({
              lenght,
              container: _container,
              coeff: videoWidth / videoHeight,
            });
            // Change track constraints
            stream.getVideoTracks().forEach((item) => {
              const oldWidth = item.getConstraints().width;
              if (oldWidth !== width) {
                let _width = 0;
                let _height = 0;
                if (videoHeight < videoWidth) {
                  _width = width;
                  _height = Math.floor(width / coeff);
                  target.setAttribute('width', _width.toString());
                  target.setAttribute('height', _height.toString());
                } else {
                  _width = Math.floor(width * coeff);
                  _height = width;
                  target.setAttribute('width', _width.toString());
                  target.setAttribute('height', _height.toString());
                }
                target.parentElement?.parentElement?.setAttribute(
                  'style',
                  `grid-template-columns: repeat(${cols}, auto);
                  grid-template-rows: repeat(${rows}, auto);`
                );

                item
                  .applyConstraints({ width: _width, height: _height })
                  .then(() => {
                    log('log', 'Constraints changed', {
                      width,
                      oldWidth,
                    });
                  })
                  .catch((error) => {
                    log('log', 'Constraints not changed', {
                      error,
                      width: _width,
                      height: _height,
                      oldWidth,
                    });
                  });
              }
            });
          }
        });
      }
    },
    [lenght, container, time]
  );
};

export const useOnclickClose =
  ({ lenght, container }: { lenght: number; container: HTMLDivElement | null }) =>
  (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (container) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { target }: any = e;
      const { nodeName } = target;
      const button: HTMLButtonElement =
        nodeName === 'path'
          ? target.parentElement?.parentElement
          : nodeName === 'svg'
          ? target.parentElement
          : target;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const video: HTMLVideoElement = button.nextElementSibling as any;
      const { videoWidth, videoHeight } = video;
      const { width } = getWidthOfItem({ lenght, container, coeff: videoWidth / videoHeight });
      const coeff = videoWidth / videoHeight;
      const height = width / coeff;
      video.parentElement?.classList.remove(s.video__fixed);
      button.classList.remove(c.open);
      video.setAttribute('data', '');
      video.setAttribute('width', width.toString());
      video.setAttribute('height', height.toString());
    }
  };

export const usePressEscape = () => (e: React.KeyboardEvent<HTMLDivElement>) => {
  /** TODO */
};
