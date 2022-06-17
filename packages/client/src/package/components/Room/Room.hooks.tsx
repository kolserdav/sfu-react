/* eslint-disable no-case-declarations */
import { useEffect, useState, useMemo } from 'react';
import WS from '../../core/ws';
import RTC from '../../core/rtc';
import { getComparedString, log } from '../../utils/lib';
import { START_TIMEOUT } from '../../utils/constants';
import { MessageType } from '../../types/interfaces';
import { Streams } from '../../types';

// eslint-disable-next-line import/prefer-default-export
export const useHandleMessages = ({
  id,
  roomId,
}: {
  id: number | string;
  roomId: number | string | null;
}) => {
  const [streams, setStreams] = useState<Streams[]>([]);
  const [roomIsSaved, setRoomIsSaved] = useState<boolean>(false);

  const ws = useMemo(() => new WS(), []);
  const rtc = useMemo(() => new RTC({ ws }), [ws]);
  if (!ws.userId) {
    ws.setUserId(id);
  }

  useEffect(() => {
    if (!roomId) {
      return () => {
        /** */
      };
    }
    ws.onOpen = () => {
      ws.sendMessage({
        type: MessageType.GET_USER_ID,
        id,
        data: {},
      });
    };
    ws.onMessage = (ev) => {
      const { data } = ev;
      const rawMessage = ws.parseMessage(data);
      if (!rawMessage) {
        return;
      }
      const { type } = rawMessage;
      switch (type) {
        case MessageType.SET_USER_ID:
          rtc.createRTC({ roomId, userId: id, target: 0 });
          // Added local stream
          rtc.onAddTrack = (myId, stream) => {
            log('info', '-> Added local stream to room', { myId, id });
            const _streams = streams.map((_item) => _item);
            const isExists = _streams.filter((_item) => _item.targetId === id);
            if (!isExists[0]) {
              _streams.push({
                targetId: myId,
                stream,
                ref: (node) => {
                  if (node) {
                    // eslint-disable-next-line no-param-reassign
                    node.srcObject = stream;
                  }
                },
              });
              setStreams(_streams);
            }
          };
          rtc.invite({ roomId, userId: id, target: 0 });
          ws.sendMessage({
            type: MessageType.GET_ROOM,
            id: roomId,
            data: {
              userId: id,
            },
          });
          break;
        case MessageType.OFFER:
          rtc.handleOfferMessage(rawMessage);
          break;
        case MessageType.CANDIDATE:
          rtc.handleCandidateMessage(rawMessage);
          break;
        case MessageType.SET_CHANGE_ROOM_GUESTS:
          const { roomUsers } = ws.getMessage(MessageType.SET_CHANGE_ROOM_GUESTS, rawMessage).data;
          log('log', 'onChangeRoomGuests', { roomUsers, id });
          // Add remote streams
          roomUsers.forEach((item) => {
            const peerId = getComparedString(roomId, item);
            if (item !== id && !rtc.peerConnections[peerId]) {
              rtc.createRTC({ roomId, target: item, userId: id });
              const _streams = streams.map((_item) => _item);
              rtc.onAddTrack = (addedUserId, stream) => {
                const isExists = _streams.filter((_item) => _item.targetId === addedUserId);
                if (!isExists[0]) {
                  log('info', '-> Added stream of new user to room', { addedUserId, item, id });
                  _streams.push({
                    targetId: addedUserId,
                    stream,
                    ref: (node) => {
                      if (node) {
                        // eslint-disable-next-line no-param-reassign
                        node.srcObject = stream;
                      }
                    },
                  });
                  // Why without set timeout component unmounted while come third user?
                  setTimeout(() => {
                    setStreams(_streams);
                  }, START_TIMEOUT);
                }
              };
              rtc.invite({ roomId, userId: id, target: item });
            }
          });
          // Remove disconnected
          const _streams = streams.filter((item) => {
            const isExists = roomUsers.filter((_item) => _item === item.targetId);
            if (!isExists[0]) {
              rtc.closeVideoCall({ roomId, userId: id, target: item.targetId });
            }
            return isExists[0] !== undefined;
          });
          if (streams.length !== _streams.length) {
            setStreams(_streams);
          }
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

  return { streams };
};
