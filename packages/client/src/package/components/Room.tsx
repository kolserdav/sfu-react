/******************************************************************************************
 * Repository: https://github.com/kolserdav/uyem.git
 * File name: Room.tsx
 * Author: Sergey Kolmiller
 * Email: <uyem.ru@gmail.com>
 * License: BSD-2-Clause
 * License text: Binary distributions of this software include 'wrtc' and other third-party libraries.
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Tue Jun 21 2022 08:49:55 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/
import React, { useMemo, useContext, useRef } from 'react';
import { getTarget, log } from '../utils/lib';
import s from './Room.module.scss';
import { RoomProps } from '../types/index';
import { useConnection, useVideoDimensions, useOnclickClose, usePressEscape } from './Room.hooks';
import ThemeContext from '../Theme.context';
import { getRoomLink, getPathname, onClickVideo } from './Room.lib';
import CloseButton from './ui/CloseButton';

function Room({ id }: RoomProps) {
  const pathname = getPathname();
  const container = useRef<HTMLDivElement>(null);
  const roomId = useMemo(() => getTarget(pathname || ''), [pathname]);
  const roomLink = useMemo(() => getRoomLink(roomId), [roomId]);
  const { streams, lenght } = useConnection({ id, roomId });
  const theme = useContext(ThemeContext);
  const setVideoDimensions = useVideoDimensions({
    container: container.current,
    lenght,
  });
  const onClickClose = useOnclickClose({ container: container.current, lenght });
  const onPressEscape = usePressEscape();

  return (
    <div className={s.wrapper} style={theme.wrapper}>
      <div className={s.container} ref={container}>
        {streams.map((item, index) => (
          <div key={item.targetId} className={s.video}>
            <CloseButton onClick={onClickClose} onKeyDown={onPressEscape} tabindex={index} />
            <video
              muted={item.targetId === id}
              onTimeUpdate={(e) => {
                if (item.stream.active === false) {
                  log('warn', 'Stream is not active', { uid: item.targetId, sid: item.stream.id });
                }
                setVideoDimensions(e, item.stream);
              }}
              onClick={onClickVideo}
              ref={item.ref}
              id={item.stream.id}
              title={item.targetId.toString()}
              autoPlay
              onLoadedMetadata={(e) => {
                log('log', 'Onload meta data', { active: item.stream.active });
              }}
            />
          </div>
        ))}
      </div>
      <div className={s.actions}>
        <div>{id}</div>
        {roomLink && (
          <a style={theme.link} className={s.room__link} href={roomLink}>
            {roomLink}
          </a>
        )}
      </div>
    </div>
  );
}

export default Room;
