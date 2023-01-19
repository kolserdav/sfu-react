import React, { useMemo, useRef } from 'react';
import CloseIcon from '../Icons/Close';
import { Theme } from '../Theme';
import Request from '../utils/request';
import { useLoadVideos } from './Canvas.hooks';
import s from './Canvas.module.scss';
import IconButton from './ui/IconButton';

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

  useLoadVideos({ dirName: src, server, port, token });
  return (
    <div className={s.wrapper} style={{ backgroundColor: theme?.colors.black }}>
      <IconButton onClick={handleClose} className={s.close__button}>
        <CloseIcon color={theme?.colors.white} />
      </IconButton>
      <canvas ref={canvasRef} width={300} height={200} />
    </div>
  );
}

Canvas.defaultProps = {
  theme: undefined,
};

export default Canvas;
