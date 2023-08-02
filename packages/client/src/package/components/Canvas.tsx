/******************************************************************************************
 * Repository: https://github.com/kolserdav/werift-sfu-react.git
 * File name: Canvas.tsx
 * Author: Sergey Kolmiller
 * Email: <kolserdav@uyem.ru>
 * License: MIT
 * License text: See in LICENSE file
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Wed Aug 02 2023 23:56:49 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/
import React, { useRef } from 'react';
import CloseIcon from '../Icons/Close';
import { Theme } from '../Theme';
import { useLoadVideos, usePlay, useStrokeCanvas } from './Canvas.hooks';
import s from './Canvas.module.scss';
import IconButton from './ui/IconButton';
import VideoControls from './ui/VideoControls';

function Canvas({
  src,
  theme,
  server,
  port,
  token,
  handleClose,
}: {
  src: string;
  server: string;
  port: number;
  handleClose: () => void;
  token: string;
  theme?: Theme;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const controlsRef = useRef<HTMLDivElement>(null);

  const { episodes, videoTime, width, height, request, dir } = useLoadVideos({
    dirName: src,
    server,
    port,
    token,
    controlsRef,
  });

  const {
    maxTime,
    played,
    time,
    onPlayClickHandler,
    onChangeTimeHandler,
    replay,
    episodes: _episodes,
  } = usePlay({
    episodes,
    videoTime,
  });

  const { videos } = useStrokeCanvas({
    canvasRef,
    episodes: _episodes,
    request,
    dir,
    dirName: src,
    token,
    width,
    height,
  });
  return (
    <div className={s.wrapper} style={{ backgroundColor: theme?.colors.black }}>
      <IconButton onClick={handleClose} className={s.close__button}>
        <CloseIcon color={theme?.colors.white} />
      </IconButton>
      <div className={s.container}>
        <canvas ref={canvasRef} width={width} height={height} />
        <VideoControls
          ref={controlsRef}
          max={maxTime}
          value={time}
          theme={theme}
          played={played}
          replay={replay}
          onPlayClick={onPlayClickHandler}
          onChangeTime={onChangeTimeHandler}
        />
      </div>
      <div className={s.hidden__videos}>
        {videos.map((item) => (
          <video ref={item.ref} key={item.id} width={0} height={0}>
            <source type="video/webm" src={item.src} />
          </video>
        ))}
      </div>
    </div>
  );
}

Canvas.defaultProps = {
  theme: undefined,
};

export default Canvas;
