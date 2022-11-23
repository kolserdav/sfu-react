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
import clsx from 'clsx';
import { log, checkIsRecord } from '../utils/lib';
import s from './Room.module.scss';
import g from '../Global.module.scss';
import { RoomProps, Stream } from '../types/index';
import {
  useConnection,
  useVideoDimensions,
  useOnclickClose,
  usePressEscape,
  useAudioAnalyzer,
  useVolumeDialog,
  useSettingsDialog,
  useVideoStarted,
  useVideoHandlers,
} from './Room.hooks';
import { getRoomLink, onClickVideo, copyLink, supportDisplayMedia } from './Room.lib';
import { USER_NAME_DEFAULT } from '../utils/constants';
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
import HandUpIcon from '../Icons/HandUp';
import { useSpeaker } from '../utils/hooks';
import AccountOutlineIcon from '../Icons/AccountOutline';
import Badge from './ui/Badge';

function Room({ userId, iceServers, server, port, roomId, locale, name, theme }: RoomProps) {
  const container = useRef<HTMLDivElement>(null);
  const roomLink = useMemo(() => getRoomLink(roomId), [roomId]);
  const { createAudioAnalyzer, analyzeSoundLevel, cleanAudioAnalyzer, speaker } =
    useAudioAnalyzer();
  const { dialogSettings, clickToSettingsWrapper } = useSettingsDialog();
  const {
    askFloor,
    askeds,
    streams,
    lenght,
    lostStreamHandler,
    screenShare,
    shareScreen,
    muted,
    changeMuted,
    muteds,
    video,
    rtc,
    changeVideo,
    isOwner,
    adminMuted,
    adminMuteds,
    isRecord,
    isRecording,
    offVideo,
    clickToMuteWrapper,
    clickToUnMuteWrapper,
    clickToBanWrapper,
  } = useConnection({
    id: userId,
    roomId,
    iceServers,
    server,
    port,
    cleanAudioAnalyzer,
    locale,
    userName: name || USER_NAME_DEFAULT,
  });
  const setVideoDimensions = useVideoDimensions({
    container: container.current,
    lenght: streams.length - offVideo.length,
  });
  const onClickClose = useOnclickClose({ container: container.current, lenght });
  const onPressEscape = usePressEscape();
  const { played, setPlayed } = useVideoStarted({
    streams,
    rtc,
    lostStreamHandler,
  });
  const displayMediaSupported = useMemo(() => supportDisplayMedia(), []);
  const { dialog, clickToVolume, changeVolumeWrapper, volumes } = useVolumeDialog({
    roomId,
    container,
    userId,
  });
  const volumeUserId = useMemo(() => dialog.context.unitId, [dialog.context]);
  const settingsUserId = useMemo(() => dialogSettings.context.unitId, [dialogSettings.context]);

  const isAsked = useMemo(() => askeds.indexOf(userId) !== -1, [askeds, userId]);

  const { speaker: _speaker } = useSpeaker({ muteds, adminMuteds, speaker });

  const noActiveVideoStreams = useMemo(
    () => streams.find((item) => item.hidden !== true) === undefined,
    [streams]
  );

  const {
    onAbortWrapper,
    onEmptiedWrapper,
    onEndedWrapper,
    onLoadedDataWrapper,
    onLoadedMetadataWrapper,
    onStalledWrapper,
    onSuspendWrapper,
    onTimeUpdateWrapper,
    onWaitingWrapper,
  } = useVideoHandlers({
    createAudioAnalyzer,
    lostStreamHandler,
    setVideoDimensions,
    setPlayed,
    played,
    analyzeSoundLevel,
  });

  return (
    <div
      className={s.wrapper}
      style={{
        background: theme?.colors.paper,
        color: theme?.colors.text,
      }}
    >
      <div className={s.container} ref={container}>
        {noActiveVideoStreams && (
          <div className={s.empty} style={{ color: theme?.colors.text }}>
            {locale.noActiveVideoStreams}
          </div>
        )}
        {streams.map((item, index) =>
          (isRecord && item.target === userId) ||
          (isRecording && checkIsRecord(item.target.toString())) ? (
            ''
          ) : (
            <div
              id={item.stream.id}
              // eslint-disable-next-line react/no-array-index-key
              key={`${item.target}${index}`}
              className={clsx(s.video, item.hidden ? s.hidden : '')}
              data-connid={item.connId}
            >
              {/** CloseButton is strong first child */}
              <CloseButton onClick={onClickClose} onKeyDown={onPressEscape} tabindex={index} />
              {/** video is strong second child */}
              <video
                style={
                  _speaker === item.target
                    ? {
                        border: `2px solid ${theme?.colors.blue}`,
                      }
                    : {}
                }
                muted={
                  item.target === userId ||
                  muteds.indexOf(item.target) !== -1 ||
                  adminMuteds.indexOf(item.target) !== -1
                }
                onTimeUpdate={onTimeUpdateWrapper(item)}
                onClick={onClickVideo}
                ref={item.ref}
                title={item.target.toString()}
                id={item.target.toString()}
                onLoadedData={onLoadedDataWrapper(item)}
                onEmptied={onEmptiedWrapper(item)}
                onSuspend={onSuspendWrapper(item)}
                onStalled={onStalledWrapper(item)}
                onAbort={onAbortWrapper(item)}
                onEnded={onEndedWrapper(item)}
                onWaiting={onWaitingWrapper(item)}
                onLoadedMetadata={onLoadedMetadataWrapper(item)}
              />
              {/** actions is strong third child */}
              <div className={clsx(s.video__actions, item.hidden ? s.hidden : '')}>
                {item.isOwner && (
                  <PseudoButton title={isOwner ? locale.youAreAdminOfRoom : locale.isAdminOfRoom}>
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
                  <div className={s.setting__actions}>
                    <IconButton onClick={clickToSettingsWrapper(item.target)}>
                      <MenuIcon color={theme?.colors.white} />
                    </IconButton>
                    {askeds.indexOf(item.target) !== -1 && (
                      <IconButton
                        disabled
                        title={locale.requestedTheFloor}
                        onClick={() => {
                          /** */
                        }}
                      >
                        <HandUpIcon color={theme?.colors.white} />
                      </IconButton>
                    )}
                  </div>
                )}
              </div>
              <div className={s.muted}>
                {muteds.indexOf(item.target) !== -1 && (
                  <MicrophoneOffIcon
                    color={
                      adminMuteds.indexOf(item.target) !== -1 && (isOwner || userId === item.target)
                        ? theme?.colors.blue
                        : theme?.colors.white
                    }
                  />
                )}
              </div>
            </div>
          )
        )}
      </div>
      <div className={s.actions}>
        <div className={s.icons}>
          {theme && (
            <Badge title={locale.numberOfGuests} value={streams.length} theme={theme}>
              <IconButton title={locale.numberOfGuests} disabled>
                <AccountOutlineIcon color={theme.colors.text} />
              </IconButton>
            </Badge>
          )}
        </div>
        <div className={s.buttons}>
          {roomLink && (
            <IconButton
              title={locale.copyRoomLink}
              onClick={() => copyLink(roomLink, locale.linkCopied)}
            >
              <CopyIcon color={theme?.colors.text} />
            </IconButton>
          )}
          {displayMediaSupported && (
            <IconButton
              disabled={streams.length === 0}
              onClick={screenShare}
              title={locale.shareScreen}
            >
              {shareScreen ? (
                <CameraIcon color={theme?.colors.text} />
              ) : (
                <ScreenIcon color={theme?.colors.text} />
              )}
            </IconButton>
          )}
          {adminMuted && (
            <IconButton
              title={locale.askForTheFloor}
              onClick={askFloor}
              disabled={streams.length === 0 || isAsked}
            >
              <HandUpIcon width={40} height={40} color={theme?.colors.text} />
            </IconButton>
          )}
          <IconButton
            disabled={streams.length === 0}
            title={muted ? locale.micOn : locale.micOff}
            onClick={changeMuted}
          >
            {muted ? (
              <MicrophoneOffIcon color={theme?.colors.text} />
            ) : (
              <MicrophoneIcon color={theme?.colors.text} />
            )}
          </IconButton>
          <IconButton
            disabled={streams.length === 0}
            title={video ? locale.cameraOff : locale.cameraOn}
            onClick={changeVideo}
          >
            {video ? (
              <CameraOutlineIcon color={theme?.colors.text} />
            ) : (
              <CameraOutlineOffIcon color={theme?.colors.text} />
            )}
          </IconButton>
        </div>
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
            adminMuteds.indexOf(settingsUserId) === -1
              ? clickToMuteWrapper(dialogSettings.context)
              : clickToUnMuteWrapper(dialogSettings.context)
          }
          className={g.dialog__item}
        >
          {adminMuteds.indexOf(settingsUserId) === -1 ? locale.mute : locale.unmute}
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
