/* eslint-disable no-case-declarations */
import { useEffect, useState, useMemo } from 'react';
import WS from '../../core/ws';
import RTC from '../../core/rtc';
import { compareNumbers, log } from '../../utils/lib';
import { MessageType } from '../../types/interfaces';
import { RawStreams } from '../../types';

// eslint-disable-next-line import/prefer-default-export
export const useHandleMessages = ({ id, roomId }: { id: number; roomId: number | null }) => {
  const [streams, setStreams] = useState<RawStreams[]>([]);
  const [roomIsSaved, setRoomIsSaved] = useState<boolean>(false);

  const ws = useMemo(() => new WS(), []);
  const rtc = useMemo(() => new RTC({ ws }), [ws]);

  useEffect(() => {
    let mounted = true;
    if (!roomId) {
      return () => {
        /** */
      };
    }
    const roomOpen = Number.isInteger(roomId);
    ws.onOpen = (ev) => {
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
      const { type, id: _id } = rawMessage;
      if (type === MessageType.SET_USER_ID) {
        ws.setUserId(_id);
      }
      switch (type) {
        case MessageType.SET_USER_ID:
          if (roomOpen) {
            ws.setUserId(_id);
            rtc.createRTC({ id: roomId });
            rtc.onAddTrack = (myId, stream) => {
              log('info', 'Added local stream to room', { myId, _id });
              const _streams = streams.map((_item) => _item);
              _streams.push({ userId: myId, stream });
              setStreams(_streams);
            };
            rtc.invite({ roomId, userId: _id });
            ws.sendMessage({
              type: MessageType.GET_ROOM,
              id: roomId,
              data: {
                userId: ws.userId,
              },
            });
          }
          break;
        case MessageType.OFFER:
          if (rtc) {
            rtc.handleOfferMessage(rawMessage, (e) => {
              console.log(11, e);
            });
          }
          break;
        case MessageType.CANDIDATE:
          if (rtc) {
            rtc.handleCandidateMessage(rawMessage);
          }
          break;
        case MessageType.SET_CHANGE_ROOM_GUESTS:
          const { roomUsers } = ws.getMessage(MessageType.SET_CHANGE_ROOM_GUESTS, rawMessage).data;
          log('info', 'onChangeRoomGuests', { roomUsers, id });
          // Add new guests
          roomUsers.forEach((item) => {
            const peerId = compareNumbers(roomId, item);
            if (!rtc.peerConnections[peerId]) {
              rtc.createRTC({ id: roomId, target: item });
              const _streams = streams.map((_item) => _item);
              rtc.onAddTrack = (addedUserId, stream) => {
                log('info', 'Added stream of new user to room', { addedUserId, item, mounted });
                // If it is not me
                const isExists = _streams.filter((_item) => _item.userId === addedUserId);
                if (!isExists[0]) {
                  _streams.push({ userId: addedUserId, stream });
                  // FIXME . without setTimeout after reload some users get lost
                  setTimeout(() => {
                    setStreams(_streams);
                  }, 1000);
                }
              };
              rtc.invite({ roomId, userId: ws.userId, target: item });
            }
          });
          // Remove disconnected
          const _streams = streams.filter((item) => {
            const isExists = roomUsers.filter((_item) => _item === item.userId);
            return isExists[0] !== undefined;
          });
          if (streams.length !== _streams.length) {
            setStreams(_streams);
          }
          break;
        case MessageType.ANSWER:
          if (rtc) {
            rtc.handleVideoAnswerMsg(rawMessage, (e) => {
              if (e) {
                log('warn', 'onHandleVideoAnswerMsg', e);
              }
            });
          }
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
      mounted = false;
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
