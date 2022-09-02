import React from 'react';
import s from './Dialog.module.scss';
import { DialogProps } from '../../types';

function Dialog({ open, children, clientY, clientX, theme, width, height }: DialogProps) {
  return (
    <div
      style={{
        background: theme?.colors.text,
        color: theme?.colors.paper,
        top: clientY,
        left: clientX,
        width: open ? `${width}px` : 0,
        height: open ? `${height}px` : 0,
      }}
      className={s.wrapper}
    >
      {children}
    </div>
  );
}

export default Dialog;
