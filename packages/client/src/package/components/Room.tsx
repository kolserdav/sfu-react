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
import ScreenIcon from '../Icons/ScreeenIcon';
import IconButton from './ui/IconButton';

function Room({ id }: RoomProps) {
  const pathname = getPathname();
  const container = useRef<HTMLDivElement>(null);
  const roomId = useMemo(() => getTarget(pathname || ''), [pathname]);
  const roomLink = useMemo(() => getRoomLink(roomId), [roomId]);
  const { streams, lenght, lostStreamHandler, screenShare } = useConnection({ id, roomId });
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
          <div id={item.stream.id} key={item.target} className={s.video}>
            <CloseButton onClick={onClickClose} onKeyDown={onPressEscape} tabindex={index} />
            <video
              muted={item.target === id}
              onTimeUpdate={(e) => {
                if (item.stream.active === false) {
                  log('warn', 'Stream is not active', { uid: item.target, sid: item.stream.id });
                  lostStreamHandler({
                    video: e.target as HTMLVideoElement,
                    target: item.target,
                    connId: item.connId,
                  });
                } else {
                  setVideoDimensions(e, item.stream);
                }
              }}
              onClick={onClickVideo}
              ref={item.ref}
              title={item.target.toString()}
              onLoadedData={(e) => {
                const { target }: { target: HTMLVideoElement } = e as any;
                target.play();
              }}
              onEmptied={(e) => {
                log('warn', 'Empty video data', { active: item.stream.active, id: item.target });
              }}
              onSuspend={(e) => {
                log('warn', 'Suspend video data', { active: item.stream.active, id: item.target });
              }}
              onStalled={(e) => {
                log('warn', 'Stalled video data', { active: item.stream.active, id: item.target });
              }}
              onAbort={(e) => {
                log('warn', 'Abort video data', { active: item.stream.active, id: item.target });
              }}
              onEnded={(e) => {
                log('warn', 'End video data', { active: item.stream.active, id: item.target });
              }}
              onWaiting={(e) => {
                log('warn', 'Waiting video data', { active: item.stream.active, id: item.target });
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
        <IconButton onClick={screenShare}>
          <ScreenIcon color={theme.colors.text} />
        </IconButton>
      </div>
    </div>
  );
}

export default Room;
