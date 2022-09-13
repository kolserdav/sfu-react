import React from 'react';
import IconButton from './ui/IconButton';
import CloseIcon from '../Icons/Close';
import s from './Video.module.scss';
import { Theme } from '../Theme';

function Video({
  src,
  theme,
  handleClose,
}: {
  src: string;
  theme: Theme | undefined;
  handleClose: () => void;
}) {
  return (
    <div className={s.wrapper}>
      <IconButton onClick={handleClose} className={s.close__button}>
        <CloseIcon color={theme?.colors.white} />
      </IconButton>
      <video autoPlay width={600} height={600 / 1.3} src={src} controls />
    </div>
  );
}

export default Video;
