/******************************************************************************************
 * Repository: https://github.com/kolserdav/werift-sfu-react.git
 * File name: Room.tsx
 * Author: Sergey Kolmiller
 * Email: <uyem.ru@gmail.com>
 * License: MIT
 * License text: See in LICENSE file
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Wed Aug 24 2022 14:14:09 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/
import React, { useMemo, useContext, useRef } from 'react';
import { log } from '../utils/lib';
import s from './Room.module.scss';
import { RoomProps } from '../types/index';
import {
  useConnection,
  useVideoDimensions,
  useOnclickClose,
  usePressEscape,
  useVideoStarted,
  useAudioAnalyzer,
} from './Room.hooks';
import ThemeContext from '../Theme.context';
import { getRoomLink, onClickVideo, copyLink, supportDisplayMedia } from './Room.lib';
import { DEFAULT_USER_NAME } from '../utils/constants';
import CloseButton from './ui/CloseButton';
import ScreenIcon from '../Icons/ScreeenIcon';
import IconButton from './ui/IconButton';
import CameraIcon from '../Icons/CameraIcon';
import MicrophoneIcon from '../Icons/MicrophoneIcon';
import MicrophoneOffIcon from '../Icons/MicrophoneOffIcon';
import CameraOutlineOffIcon from '../Icons/CameraOutlineOffIcon';
import CameraOutlineIcon from '../Icons/CameraOutlineIcon';
import CopyIcon from '../Icons/CopyIcon';
import WarningIcon from '../Icons/ErrorIcon';

function Room({ userId, iceServers, server, port, roomId, locale, name }: RoomProps) {
  const container = useRef<HTMLDivElement>(null);
  const roomLink = useMemo(() => getRoomLink(roomId), [roomId]);
  const { createAudioAnalyzer, analyzeSoundLevel, cleanAudioAnalyzer, speaker } =
    useAudioAnalyzer();
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
    ws,
    rtc,
    changeVideo,
    error,
  } = useConnection({
    id: userId,
    roomId,
    iceServers,
    server,
    port: port.toString(),
    cleanAudioAnalyzer,
    locale,
    userName: name || DEFAULT_USER_NAME,
  });
  const theme = useContext(ThemeContext);
  const setVideoDimensions = useVideoDimensions({
    container: container.current,
    lenght,
  });
  const onClickClose = useOnclickClose({ container: container.current, lenght });
  const onPressEscape = usePressEscape();
  const { played, setPlayed } = useVideoStarted({
    streams,
    ws,
    rtc,
    container: container.current,
    roomId,
    lostStreamHandler,
  });
  const displayMediaSupported = useMemo(() => supportDisplayMedia(), []);

  return (
    <div
      className={s.wrapper}
      style={{
        background: theme.colors.paper,
        color: theme.colors.text,
      }}
    >
      <div className={s.container} ref={container}>
        {streams.map((item, index) => (
          <div id={item.stream.id} key={item.target} className={s.video} data-connid={item.connId}>
            {/** CloseButton is strong first child */}
            <CloseButton onClick={onClickClose} onKeyDown={onPressEscape} tabindex={index} />
            {/** video is strong second child */}
            <video
              className={speaker === item.target ? s.speaker : ''}
              muted={item.target === userId || muteds.indexOf(item.target.toString()) !== -1}
              onTimeUpdate={(e) => {
                analyzeSoundLevel(item.target);
                if (item.stream.active === false) {
                  log('warn', `Stream is not active ${item.target}`, {
                    uid: item.target,
                    stream: item.stream,
                  });
                  lostStreamHandler({
                    target: item.target,
                    connId: item.connId,
                    eventName: 'stream-not-active',
                  });
                } else {
                  setVideoDimensions(e, item.stream);
                  if (!played[item.target]) {
                    const _played = { ...played };
                    _played[item.target] = true;
                    setPlayed(_played);
                  }
                }
              }}
              onClick={onClickVideo}
              ref={item.ref}
              title={item.target.toString()}
              id={item.target.toString()}
              onLoadedData={(e) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const { target }: { target: HTMLVideoElement } = e as any;
                target.play();
                const tracks = item.stream.getTracks();
                if (tracks.length < 2) {
                  log('warn', 'Stream have less than 2 tracks', { item, tracks });
                }
              }}
              onEmptied={(e) => {
                log('warn', 'Empty video data', {
                  stream: item.stream,
                  id: item.target,
                  tracks: item.stream.getTracks(),
                });
              }}
              onSuspend={() => {
                log('info', 'Suspend video data', {
                  stream: item.stream,
                  id: item.target,
                  tracks: item.stream.getTracks(),
                });
              }}
              onStalled={(e) => {
                log('warn', 'Stalled video data', {
                  stream: item.stream,
                  id: item.target,
                  tracks: item.stream.getTracks(),
                });
              }}
              onAbort={(e) => {
                log('warn', 'Abort video data', {
                  stream: item.stream,
                  id: item.target,
                  tracks: item.stream.getTracks(),
                });
              }}
              onEnded={(e) => {
                log('warn', 'End video data', {
                  stream: item.stream,
                  id: item.target,
                  tracks: item.stream.getTracks(),
                });
              }}
              onWaiting={(e) => {
                log('warn', 'Waiting video data', {
                  active: item.stream.active,
                  id: item.target,
                  t: (e.target as HTMLVideoElement).played,
                });
              }}
              onLoadedMetadata={() => {
                log('info', 'Meta data loaded', { ...item });
                if (!played[item.target]) {
                  const _played = { ...played };
                  _played[item.target] = true;
                  setPlayed(_played);
                }
                createAudioAnalyzer(item);
              }}
            />
            <div className={s.muted}>
              {muteds.indexOf(item.target.toString()) !== -1 && <MicrophoneOffIcon color="#fff" />}
            </div>
          </div>
        ))}
        {error && (
          <div className={s.error}>
            <WarningIcon color={theme.colors.yellow} />
            {error}
          </div>
        )}
      </div>
      <div className={s.actions}>
        {roomLink && (
          <div className={s.link__container}>
            <input disabled className={s.link__input} value={roomLink} />
            <IconButton onClick={() => copyLink(roomLink)}>
              <CopyIcon color={theme.colors.text} />
            </IconButton>
          </div>
        )}
        {displayMediaSupported && (
          <IconButton onClick={screenShare}>
            {shareScreen ? (
              <CameraIcon color={theme.colors.text} />
            ) : (
              <ScreenIcon color={theme.colors.text} />
            )}
          </IconButton>
        )}
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
