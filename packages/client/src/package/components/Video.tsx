/******************************************************************************************
 * Repository: https://github.com/kolserdav/werift-sfu-react.git
 * File name: Video.tsx
 * Author: Sergey Kolmiller
 * Email: <kolserdav@uyem.ru>
 * License: MIT
 * License text: See in LICENSE file
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Wed Aug 02 2023 23:56:49 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/
import React from 'react';
import IconButton from './ui/IconButton';
import CloseIcon from '../Icons/Close';
import s from './Video.module.scss';
import { Theme } from '../Theme';
import { FULL_HD_COEFF, MOBILE_WIDTH } from '../utils/constants';

function Video({
  src,
  theme,
  handleClose,
}: {
  src: string;
  theme: Theme | undefined;
  handleClose: () => void;
}) {
  const width =
    typeof window === 'undefined'
      ? MOBILE_WIDTH
      : MOBILE_WIDTH > window.innerWidth
      ? window.innerWidth
      : MOBILE_WIDTH;

  return (
    <div className={s.wrapper}>
      <IconButton onClick={handleClose} className={s.close__button}>
        <CloseIcon color={theme?.colors.white} />
      </IconButton>
      <video autoPlay width={width} height={width / FULL_HD_COEFF} src={src} controls />
    </div>
  );
}

export default Video;
