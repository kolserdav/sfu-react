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

  const { episodes, videoTime, width, height, dir, request } = useLoadVideos({
    dirName: src,
    server,
    port,
    token,
    controlsRef,
  });
  const { maxTime, played, time, onPlayClickHandler, onChangeTimeHandler, replay } = usePlay({
    episodes,
    videoTime,
  });

  const { videos } = useStrokeCanvas({
    canvasRef,
    dir,
    request,
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
