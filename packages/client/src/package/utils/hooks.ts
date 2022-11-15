import { useEffect, useMemo, useState } from 'react';
import storeStreams from '../store/streams';
import { RoomList, RoomUser } from '../types/interfaces';

export const useSpeaker = ({
  muteds,
  adminMuteds,
  speaker: _speaker,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  muteds: RoomList[any];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  adminMuteds: RoomList[any];
  speaker: string | number;
}) => {
  const speaker = useMemo(
    () => (muteds.indexOf(_speaker) === -1 && adminMuteds.indexOf(_speaker) === -1 ? _speaker : 0),
    [_speaker, muteds, adminMuteds]
  );
  return { speaker };
};

export const useIsOwner = ({ userId }: { userId: string | number }) => {
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [roomUsers, setRoomUsers] = useState<RoomUser[]>([]);
  /**
   * Listen change users
   */
  useEffect(() => {
    const cleanSubs = storeStreams.subscribe(() => {
      const state = storeStreams.getState();
      let _isOwner = false;
      const _users = state.streams.map((item) => {
        if (item.target === userId) {
          _isOwner = item.isOwner;
        }
        return {
          id: item.target,
          name: item.name,
          isOwner: item.isOwner,
        };
      });
      setIsOwner(_isOwner);
      setRoomUsers(_users);
    });
    return () => {
      cleanSubs();
    };
  }, [userId]);

  return { isOwner, roomUsers };
};
