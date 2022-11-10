import { useMemo } from 'react';
import { RoomList } from '../types/interfaces';

// eslint-disable-next-line import/prefer-default-export
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
  return speaker;
};
