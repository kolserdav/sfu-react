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
import { START_DELAY } from '../utils/constants';
import { MessageType, SendMessageArgs } from '../types/interfaces';
import { Streams } from '../types';
import s from './Room.module.scss';
import c from './ui/CloseButton.module.scss';

// eslint-disable-next-line import/prefer-default-export
export const useConnection = ({
  id,
  roomId,
}: {
  id: number | string;
  roomId: number | string | null;
}) => {
  const [streams, setStreams] = useState<Streams[]>([]);
  const [roomIsSaved, setRoomIsSaved] = useState<boolean>(false);
  const [lenght, setLenght] = useState<number>(0);
  const [connectionId, setConnectionId] = useState<string>('');

  const ws = useMemo(() => new WS(), []);
  const rtc = useMemo(() => new RTC({ ws }), [ws]);

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
      log('warn', 'Lost stream handler without peer connection', { peerId });
      return;
    }
    rtc.closeVideoCall({ roomId, userId: ws.userId, target, connId });
    const _strems = streams.filter((item) => item.target !== target);
    setStreams(_strems);
    video.parentElement?.removeChild(video);
  };

  useEffect(() => {
    if (!roomId) {
      return () => {
        /** */
      };
    }
    if (!ws.userId) {
      ws.setUserId(id);
    }
    const onAddTrack = ({
      _streams,
      addedUserId,
      stream,
      connId,
    }: {
      _streams: Streams[];
      addedUserId: string | number;
      stream: MediaStream;
      connId: string;
    }) => {
      const isExists = _streams.filter((_item) => _item.target === addedUserId);
      if (!isExists[0]) {
        _streams.push({
          target: addedUserId,
          stream,
          connId,
          ref: (node) => {
            if (node) {
              // eslint-disable-next-line no-param-reassign
              node.srcObject = stream;
            }
          },
        });
        setTimeout(() => {
          log('info', 'Set streams', { _streams });
          setStreams(_streams);
        }, START_DELAY);
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
      } = ws.getMessage(MessageType.SET_CHANGE_ROOM_GUESTS, rawMessage);
      const _streams = streams.map((_item) => _item);
      log('info', 'onChangeRoomGuests', { roomUsers, id, st: _streams.map((i) => i.target) });
      // Add remote streams
      setLenght(roomUsers.length);
      roomUsers.forEach((item) => {
        if (item !== id) {
          const peerId = rtc.getPeerId(roomId, item, connId);
          const _isExists = _streams.filter((_item) => item === _item.target);
          if (!_isExists[0]) {
            log('info', 'Check new user', { item });
            rtc.createRTC({ roomId, target: item, userId: id, connId });
            rtc.onAddTrack = (addedUserId, stream) => {
              log('info', '-> Added remote stream to room', { addedUserId, id });
              onAddTrack({ _streams, addedUserId, stream, connId });
            };
            rtc.invite({ roomId, userId: id, target: item, connId });
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
                  _streams.splice(index, 1);
                  setTimeout(() => {
                    setStreams(_streams);
                  }, START_DELAY / 3);
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
          rtc.createRTC({ roomId, userId: id, target: 0, connId });
          // Added local stream
          rtc.onAddTrack = (myId, stream) => {
            log('info', '-> Added stream to room', { myId, id });
            const _streams = streams.map((_item) => _item);
            onAddTrack({ _streams, addedUserId: myId, stream, connId });
          };
          rtc.invite({ roomId, userId: id, target: 0, connId });
          ws.sendMessage({
            type: MessageType.GET_ROOM,
            id: roomId,
            data: {
              userId: id,
            },
            connId,
          });
          break;
        case MessageType.OFFER:
          rtc.handleOfferMessage(rawMessage);
          break;
        case MessageType.CANDIDATE:
          rtc.handleCandidateMessage(rawMessage);
          break;
        case MessageType.SET_CHANGE_ROOM_GUESTS:
          changeRoomGuestsHandler({ rawMessage });
          break;
        case MessageType.ANSWER:
          rtc.handleVideoAnswerMsg(rawMessage);
          break;
        case MessageType.SET_ROOM:
          setRoomIsSaved(true);
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
  }, [roomId, streams, ws, rtc, id, roomIsSaved]);

  useEffect(() => {
    if (!roomId) {
      return () => {
        /** */
      };
    }
    const interval = setInterval(() => {
      if (lenght !== streams.length) {
        setTimeout(() => {
          ws.sendMessage({
            type: MessageType.GET_CHANGE_ROOM_GUESTS,
            id,
            connId: connectionId,
            data: {
              roomId,
            },
          });
        }, 1000);
      }
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, [roomId, ws, lenght, streams, connectionId, id]);

  return { streams, lenght, lostStreamHandler };
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
