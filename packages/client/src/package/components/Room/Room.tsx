import React, { useEffect, useMemo, useState } from 'react';
import { log, getTarget } from '../../utils/lib';
import s from './Room.module.scss';
import { RoomProps } from '../../types/index';
import { useHandleMessages } from './Room.hooks';
import { createStreams, getRoomLink, getPathname } from './Room.lib';

function Room({ id }: RoomProps) {
  const pathname = getPathname();
  const roomId = useMemo(() => getTarget(pathname || ''), [pathname]);
  const { streams } = useHandleMessages({ id, roomId });

  const _streams = useMemo(() => createStreams(streams), [streams]);
  const roomLink = useMemo(() => getRoomLink(roomId), [roomId]);

  return (
    <div className={s.wrapper}>
      <div className={s.container}>
        {_streams.map((item) => (
          <div key={item.userId} className={s.video}>
            <video
              width={300}
              height={200}
              ref={item.ref}
              id={item.userId.toString()}
              title={item.userId.toString()}
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
