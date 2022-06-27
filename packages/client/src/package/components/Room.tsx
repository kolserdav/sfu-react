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
import CameraIcon from '../Icons/CameraIcon';
import MicrophoneIcon from '../Icons/MicrophoneIcon';
import MicrophoneOffIcon from '../Icons/MicrophoneOffIcon';
import CameraOutlineOffIcon from '../Icons/CameraOutlineOffIcon';
import CameraOutlineIcon from '../Icons/CameraOutlineIcon';

function Room({ id }: RoomProps) {
  const pathname = getPathname();
  const container = useRef<HTMLDivElement>(null);
  const roomId = useMemo(() => getTarget(pathname || ''), [pathname]);
  const roomLink = useMemo(() => getRoomLink(roomId), [roomId]);
  const {
    streams,
    lenght,
    lostStreamHandler,
    screenShare,
    shareScreen,
    muted,
    changeMuted,
    muteds,
    video,
    changeVideo,
  } = useConnection({
    id,
    roomId,
  });
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
            <div className={s.muted}>
              {muteds.indexOf(item.target.toString()) !== -1 && <MicrophoneOffIcon color="#fff" />}
            </div>
            <video
              muted={item.target === id || muteds.indexOf(item.target.toString()) !== -1}
              onTimeUpdate={(e) => {
                if (item.stream.active === false) {
                  log('warn', 'Stream is not active', { uid: item.target, sid: item.stream.id });
                  lostStreamHandler({
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
          {shareScreen ? (
            <CameraIcon color={theme.colors.text} />
          ) : (
            <ScreenIcon color={theme.colors.text} />
          )}
        </IconButton>
        <IconButton onClick={changeMuted}>
          {muted ? (
            <MicrophoneOffIcon color={theme.colors.text} />
          ) : (
            <MicrophoneIcon color={theme.colors.text} />
          )}
        </IconButton>
        <IconButton onClick={changeVideo}>
          {video ? (
            <CameraOutlineIcon color={theme.colors.text} />
          ) : (
            <CameraOutlineOffIcon color={theme.colors.text} />
          )}
        </IconButton>
      </div>
    </div>
  );
}

export default Room;
