import React, { useMemo } from 'react';
import { getTarget } from '../../utils/lib';
import s from './Room.module.scss';
import { RoomProps } from '../../types/index';
import { useHandleMessages } from './Room.hooks';
import { getRoomLink, getPathname } from './Room.lib';

function Room({ id }: RoomProps) {
  const pathname = getPathname();
  const roomId = useMemo(() => getTarget(pathname || ''), [pathname]);
  const { streams } = useHandleMessages({ id, roomId });
  const roomLink = useMemo(() => getRoomLink(roomId), [roomId]);

  return (
    <div className={s.wrapper}>
      <div className={s.container}>
        {streams.map((item) => (
          <div key={item.targetId} className={s.video}>
            <video
              muted={item.targetId === id}
              width={300}
              height={200}
              ref={item.ref}
              id={item.targetId.toString()}
              title={item.targetId.toString()}
              autoPlay
            />
          </div>
        ))}
      </div>
      <div className={s.actions}>
        <div>{id}</div>
        {roomLink && (
          <a className={s.room__link} href={roomLink}>
            {roomLink}
          </a>
        )}
      </div>
    </div>
  );
}

export default Room;
