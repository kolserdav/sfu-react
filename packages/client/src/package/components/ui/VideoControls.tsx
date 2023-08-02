/******************************************************************************************
 * Repository: https://github.com/kolserdav/werift-sfu-react.git
 * File name: VideoControls.tsx
 * Author: Sergey Kolmiller
 * Email: <kolserdav@uyem.ru>
 * License: MIT
 * License text: See in LICENSE file
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Wed Aug 02 2023 23:56:49 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { forwardRef, useEffect, useState } from 'react';
import { format } from 'date-fns';
import s from './VideoControls.module.scss';
import PlayIcon from '../../Icons/Play';
import PauseIcon from '../../Icons/Pause';
import IconButton from './IconButton';
import { Theme } from '../../Theme';
import ReplayIcon from '../../Icons/Replay';
import { DEFAULT_TIME } from '../../utils/constants';

const VideoControls = forwardRef<
  HTMLDivElement,
  {
    max: number;
    value: number;
    played: boolean;
    replay: boolean;
    onPlayClick: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
    onChangeTime: (e: React.ChangeEvent<HTMLInputElement>) => void;
    theme?: Theme;
  }
>(({ max, value, played, replay, onPlayClick, onChangeTime, theme }, ref) => {
  const [timeStr, setTimeStr] = useState<string>(DEFAULT_TIME);
  const [maxStr, setMaxStr] = useState<string>(DEFAULT_TIME);

  /**
   * Set time str
   */
  useEffect(() => {
    const date = new Date(0, 0, 0, 0, 0, 0).getTime() + value * 1000;

    setTimeStr(format(date, 'HH:mm:ss'));
  }, [value]);

  /**
   * Set max str
   */
  useEffect(() => {
    const date = new Date(0, 0, 0, 0, 0, 0).getTime() + max * 1000;

    setMaxStr(format(date, 'HH:mm:ss'));
  }, [max]);

  return (
    <div ref={ref} className={s.wrapper} style={{ background: theme?.colors.paper }}>
      <input type="range" value={value} max={max} onChange={onChangeTime} />
      <div className={s.input__group}>
        <IconButton width={40} height={40} className={s.play__button} onClick={onPlayClick}>
          {played ? (
            <PauseIcon color={theme?.colors.text} />
          ) : replay ? (
            <ReplayIcon color={theme?.colors.text} />
          ) : (
            <PlayIcon color={theme?.colors.text} />
          )}
        </IconButton>
        <div className={s.time} style={{ color: theme?.colors.text }}>
          {timeStr} / {maxStr}
        </div>
      </div>
    </div>
  );
});

VideoControls.defaultProps = {
  theme: undefined,
};

export default VideoControls;
