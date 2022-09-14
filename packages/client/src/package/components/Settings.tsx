import React from 'react';
import clsx from 'clsx';
import IconButton from './ui/IconButton';
import RecIcon from '../Icons/Rec';
import StopIcon from '../Icons/Stop';
import { changeThemeHandler } from './Hall.lib';
import ThemeIcon from '../Icons/ThemeIcon';
import { LocaleSelector } from '../types/interfaces';
import Select from './ui/Select';
import s from './Settings.module.scss';
import { SettingsProps } from '../types';
import { useRecordVideos, useSettings, usePlayVideo, useDeleteVideo } from './Settings.hooks';
import PlayIcon from '../Icons/Play';
import Video from './Video';
import DeleteIcon from '../Icons/Delete';
import WS from '../core/ws';

function Settings({ theme, open, locale, roomId, userId, isOwner, server, port }: SettingsProps) {
  const {
    settingsRef,
    settingStyle,
    recordStartWrapper,
    buttonDisabled,
    videos,
    setSkip,
    skip,
    setButtonDisabled,
  } = useRecordVideos({
    roomId,
    userId,
  });
  const { time, started, lang, changeLang } = useSettings({
    buttonDisabled,
    setButtonDisabled,
    setSkip,
    skip,
  });
  const { playVideoWrapper, playedVideo, handleCloseVideo } = usePlayVideo({
    server,
    port,
    roomId,
    setSkip,
    skip,
  });

  const { deleteVideoWrapper } = useDeleteVideo();

  return (
    <div
      style={{ background: theme?.colors.paper }}
      className={clsx(s.wrapper, open ? s.open : '')}
    >
      <div className={s.item} style={{ boxShadow: `1px 3px 1px ${theme?.colors.active}` }}>
        <h5 className={s.item__title}>{locale.generalSettings}</h5>

        <Select theme={theme} onChange={changeLang} value={lang} title={locale.changeLang}>
          {LocaleSelector}
        </Select>

        <div className={s.item__row}>
          <h6 className={s.item__title}>{locale.darkTheme}</h6>
          <div className={s.item__actions}>
            <IconButton onClick={changeThemeHandler} title={locale.changeTheme}>
              <ThemeIcon color={theme?.colors.text} />
            </IconButton>
          </div>
        </div>
      </div>
      <div
        className={s.item}
        ref={settingsRef}
        style={settingStyle ? { boxShadow: `1px 3px 1px ${theme?.colors.active}` } : {}}
      >
        <h5 className={s.item__title}>{locale.recordActions}</h5>
        <div className={s.item__row}>
          <h6 className={s.item__title}>{locale.recordVideo}</h6>
          <div className={s.item__actions}>
            <IconButton
              title={started ? locale.stopRecord : locale.startRecord}
              className={started ? s.text__button : ''}
              onClick={recordStartWrapper(started ? 'stop' : 'start')}
              disabled={!isOwner || buttonDisabled}
            >
              <div className={s.record}>
                {started && <div className={s.time}>{time}</div>}
                {started ? (
                  <StopIcon color={theme?.colors.red} />
                ) : (
                  <RecIcon color={theme?.colors.red} />
                )}
              </div>
            </IconButton>
          </div>
        </div>
        <div className={s.videos}>
          {videos.map((item) => (
            <div className={s.video} key={item.id}>
              <div className={s.name}>{item.name}</div>
              <div className={s.actions}>
                <IconButton onClick={playVideoWrapper(item.name)}>
                  <PlayIcon width={20} height={20} color={theme?.colors.blue} />
                </IconButton>
                <IconButton onClick={deleteVideoWrapper(item.id)}>
                  <DeleteIcon width={16} height={16} color={theme?.colors.red} />
                </IconButton>
              </div>
            </div>
          ))}
        </div>
      </div>
      {playedVideo && <Video handleClose={handleCloseVideo} theme={theme} src={playedVideo} />}
    </div>
  );
}

export default Settings;
