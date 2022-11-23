/******************************************************************************************
 * Repository: https://github.com/kolserdav/werift-sfu-react.git
 * File name: hooks.ts
 * Author: Sergey Kolmiller
 * Email: <uyem.ru@gmail.com>
 * License: MIT
 * License text: See in LICENSE file
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Wed Nov 23 2022 15:23:26 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/
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
