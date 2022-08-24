import React, { useContext } from 'react';
import clsx from 'clsx';
import s from './Dialog.module.scss';
import ThemeContext from '../../Theme.context';
import { DialogProps } from '../../types';

function Dialog({ open, children, clientY, clientX }: DialogProps) {
  const theme = useContext(ThemeContext);
  return (
    <div
      style={{
        background: theme.colors.text,
        color: theme.colors.paper,
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
