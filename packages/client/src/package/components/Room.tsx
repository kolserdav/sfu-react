/******************************************************************************************
 * Repository: https://github.com/kolserdav/uyem.git
 * File name: Room.tsx
 * Author: Sergey Kolmiller
 * Email: <uyem.ru@gmail.com>
 * License: BSD-2-Clause
 * License text: Binary distributions of this software include WebRTC and other third-party libraries.
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Sun Jun 19 2022 01:44:53 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/
import React, { useMemo, useContext } from 'react';
import clsx from 'clsx';
import { getTarget } from '../utils/lib';
import s from './Room.module.scss';
import { RoomProps } from '../types/index';
import { useConnection } from './Room.hooks';
import { ThemeContext } from '../Main.context';
import { getRoomLink, getPathname } from './Room.lib';

function Room({ id }: RoomProps) {
  const pathname = getPathname();
  const roomId = useMemo(() => getTarget(pathname || ''), [pathname]);
  const roomLink = useMemo(() => getRoomLink(roomId), [roomId]);
  const { streams } = useConnection({ id, roomId });
  const theme = useContext(ThemeContext);

  return (
    <div className={clsx(theme.wrapper, s.wrapper)}>
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
          <a className={clsx(theme.link, s.room__link)} href={roomLink}>
            {roomLink}
          </a>
        )}
      </div>
    </div>
  );
}

export default Room;
