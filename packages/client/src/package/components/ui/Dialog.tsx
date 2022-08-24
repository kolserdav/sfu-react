import React, { useContext, useState, useEffect, useRef } from 'react';
import clsx from 'clsx';
import s from './Dialog.module.scss';
import ThemeContext from '../../Theme.context';
import { DialogProps } from '../../types';
import { DIALOG_DEFAULT, DIALOG_TIMEOUT } from '../../utils/constants';
import storeDialog, { changeDialog } from '../../store/dialog';

function Dialog({ children, type, open }: DialogProps) {
  const theme = useContext(ThemeContext);
  const dialogRef = useRef<HTMLDivElement>(null);
  const [mouseMove, setMouseMove] = useState<boolean>(false);

  /**
   * Close dialog
   */
  useEffect(() => {
    let timeout = setTimeout(() => {
      /** */
    }, 0);
    if (!mouseMove && open) {
      timeout = setTimeout(() => {
        storeDialog.dispatch(changeDialog({ dialog: DIALOG_DEFAULT }));
      }, DIALOG_TIMEOUT);
    }
    return () => {
      clearTimeout(timeout);
    };
  }, [open, mouseMove]);

  /**
   * On mouse move
   */
  useEffect(() => {
    const { current } = dialogRef;
    const onMouseMove = () => {
      setMouseMove(true);
    };
    if (current) {
      current.addEventListener('mouseover', onMouseMove);
    }
    return () => {
      if (current) {
        current.removeEventListener('mouseover', onMouseMove);
      }
    };
  }, []);

  /**
   * On mouse leave
   */
  useEffect(() => {
    const { current } = dialogRef;
    const onMouseLeave = (e: MouseEvent) => {
      setMouseMove(false);
    };
    if (current) {
      current.addEventListener('mouseout', onMouseLeave);
    }
    return () => {
      if (current) {
        current.addEventListener('mouseout', onMouseLeave);
      }
    };
  }, []);

  return (
    <div
      ref={dialogRef}
      className={clsx(s.wrapper, open ? s.open : '')}
      style={{
        background:
          type === 'error'
            ? theme.colors.red
            : type === 'warn'
            ? theme.colors.yellow
            : theme.colors.blue,
      }}
    >
      {children}
    </div>
  );
}

export default Dialog;
