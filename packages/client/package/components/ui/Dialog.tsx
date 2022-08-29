import React from 'react';
import clsx from 'clsx';
import s from './Dialog.module.scss';
import { DialogProps } from '../../types';

function Dialog({ open, children, clientY, clientX, theme }: DialogProps) {
  return (
    <div
      style={{
        background: theme?.colors.text,
        color: theme?.colors.paper,
        top: clientY,
        left: clientX,
      }}
      className={clsx(s.wrapper, open ? s.open : '')}
    >
      {children}
    </div>
  );
}

export default Dialog;
