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
import React, { useMemo, useRef } from 'react';
import { log } from '../utils/lib';
import s from './Room.module.scss';
import g from '../Global.module.scss';
import { RoomProps } from '../types/index';
import {
  useConnection,
  useVideoDimensions,
  useOnclickClose,
  usePressEscape,
  useAudioAnalyzer,
  useVolumeDialog,
  useSettingsDialog,
} from './Room.hooks';
import {
  getRoomLink,
  onClickVideo,
  copyLink,
  supportDisplayMedia,
  getVolumeContext,
  getSettingsContext,
} from './Room.lib';
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
import VolumeHeightIcon from '../Icons/VolumeHeight';
import VolumeMediumIcon from '../Icons/VolumeMedium';
import VolumeLowIcon from '../Icons/VolumeLow';
import Dialog from './ui/Dialog';
import MenuIcon from '../Icons/Menu';
import CrownIcon from '../Icons/Crown';
import PseudoButton from './ui/PseudoButton';

function Room({ userId, iceServers, server, port, roomId, locale, name, theme }: RoomProps) {
  const container = useRef<HTMLDivElement>(null);
  const videoActionsRef = useRef<HTMLDivElement>(null);
  const roomLink = useMemo(() => getRoomLink(roomId), [roomId]);
  const { createAudioAnalyzer, analyzeSoundLevel, cleanAudioAnalyzer, speaker } =
    useAudioAnalyzer();
  const {
    dialogSettings,
    clickToSettingsWrapper,
    clickToBanWrapper,
    clickToMuteWrapper,
    clickToUnMuteWrapper,
    toBan,
    toMute,
    toUnMute,
    setToMute,
    setToUnMute,
    setToBan,
  } = useSettingsDialog();
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
    isOwner,
    adminMuted,
    adminMuteds,
  } = useConnection({
    id: userId,
    roomId,
    iceServers,
    server,
    port,
    cleanAudioAnalyzer,
    locale,
    userName: name || DEFAULT_USER_NAME,
    toMute,
    toBan,
    toUnMute,
    setToMute,
    setToUnMute,
    setToBan,
  });

  const setVideoDimensions = useVideoDimensions({
    container: container.current,
    lenght,
  });
  const onClickClose = useOnclickClose({ container: container.current, lenght });
  const onPressEscape = usePressEscape();
  const displayMediaSupported = useMemo(() => supportDisplayMedia(), []);
  const { dialog, clickToVolume, changeVolumeWrapper, volumes } = useVolumeDialog({
    roomId,
    container,
    userId,
  });
  const volumeUserId = useMemo(() => getVolumeContext(dialog.context).userId, [dialog.context]);
  const settingsUserId = useMemo(
    () => getSettingsContext(dialogSettings.context).userId,
    [dialogSettings.context]
  );
  return (
    <div
      className={s.wrapper}
      style={{
        background: theme?.colors.paper,
        color: theme?.colors.text,
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
                log('info', 'Empty video data', {
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
                log('info', 'Abort video data', {
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
                createAudioAnalyzer(item);
              }}
            />
            {/** actions is strong third child */}

            <div ref={videoActionsRef} className={s.video__actions}>
              {item.isOwner && (
                <PseudoButton
                  refActions={videoActionsRef}
                  title={isOwner ? locale.youAreAdminOfRoom : locale.isAdminOfRoom}
                >
                  <CrownIcon color={theme?.colors.yellow} />
                </PseudoButton>
              )}
              {item.target !== userId && (
                <IconButton onClick={clickToVolume(item.target)}>
                  {volumes[item.target] === undefined || volumes[item.target] >= 8 ? (
                    <VolumeHeightIcon color={theme?.colors.white} />
                  ) : volumes[item.target] >= 3 ? (
                    <VolumeMediumIcon color={theme?.colors.white} />
                  ) : (
                    <VolumeLowIcon color={theme?.colors.white} />
                  )}
                </IconButton>
              )}
              {isOwner && item.target !== userId && (
                <IconButton onClick={clickToSettingsWrapper(item.target)}>
                  <MenuIcon color={theme?.colors.white} />
                </IconButton>
              )}
            </div>
            <div className={s.muted}>
              {muteds.indexOf(item.target.toString()) !== -1 && (
                <MicrophoneOffIcon
                  color={
                    adminMuteds.indexOf(item.target.toString()) !== -1 &&
                    (isOwner || userId === item.target)
                      ? theme?.colors.blue
                      : theme?.colors.white
                  }
                />
              )}
            </div>
          </div>
        ))}
      </div>
      <div className={s.actions}>
        {roomLink && (
          <div className={s.link__container}>
            <input disabled className={s.link__input} value={roomLink} />
            <IconButton onClick={() => copyLink(roomLink)}>
              <CopyIcon color={theme?.colors.text} />
            </IconButton>
          </div>
        )}
        {displayMediaSupported && (
          <IconButton onClick={screenShare} title={locale.shareScreen}>
            {shareScreen ? (
              <CameraIcon color={theme?.colors.text} />
            ) : (
              <ScreenIcon color={theme?.colors.text} />
            )}
          </IconButton>
        )}
        <IconButton onClick={changeMuted} disabled={adminMuted}>
          {muted || adminMuted ? (
            <MicrophoneOffIcon color={theme?.colors.text} />
          ) : (
            <MicrophoneIcon color={theme?.colors.text} />
          )}
        </IconButton>
        <IconButton onClick={changeVideo}>
          {video ? (
            <CameraOutlineIcon color={theme?.colors.text} />
          ) : (
            <CameraOutlineOffIcon color={theme?.colors.text} />
          )}
        </IconButton>
      </div>
      <Dialog {...dialog} theme={theme}>
        <input
          onChange={changeVolumeWrapper(volumeUserId)}
          className={s.video__volume__input}
          value={volumes[volumeUserId] || 10}
          type="range"
          min="0"
          max="10"
        />
      </Dialog>
      <Dialog {...dialogSettings} theme={theme}>
        {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events */}
        <div
          tabIndex={-1}
          role="button"
          onClick={
            rtc.muteds.indexOf(settingsUserId) === -1
              ? clickToMuteWrapper(dialogSettings.context)
              : clickToUnMuteWrapper(dialogSettings.context)
          }
          className={g.dialog__item}
        >
          {rtc.muteds.indexOf(settingsUserId) === -1 ? locale.mute : locale.unmute}
        </div>
        {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events */}
        <div
          tabIndex={-1}
          role="button"
          onClick={clickToBanWrapper(dialogSettings.context)}
          className={g.dialog__item}
        >
          {locale.ban}
        </div>
      </Dialog>
    </div>
  );
}

export default Room;
