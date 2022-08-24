import React, { useContext, useState, useEffect, useRef } from 'react';
import clsx from 'clsx';
import s from './Dialog.module.scss';
import ThemeContext from '../../Theme.context';
import { DialogProps } from '../../types';
import { DIALOG_TIMEOUT } from '../../utils/constants';

function Dialog({ children, type, open }: DialogProps) {
  const theme = useContext(ThemeContext);
  const dialogRef = useRef<HTMLDivElement>(null);
  const [dialogOpen, setDialogOpen] = useState<boolean>(open);
  const [mouseMove, setMouseMove] = useState<boolean>(false);

  /**
   * Set dialog
   */
  useEffect(() => {
    setDialogOpen(open);
  }, [open]);

  /**
   * Close dialog
   */
  useEffect(() => {
    let timeout = setTimeout(() => {
      /** */
    }, 0);
    if (!mouseMove) {
      timeout = setTimeout(() => {
        setDialogOpen(false);
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
      current.addEventListener('mousemove', onMouseMove);
    }
    return () => {
      if (current) {
        current.removeEventListener('mousemove', onMouseMove);
      }
    };
  }, []);

  /**
   * On mouse leave
   */
  useEffect(() => {
    const { current } = dialogRef;
    const onMouseLeave = () => {
      setMouseMove(false);
    };
    if (current) {
      current.addEventListener('mouseleave', onMouseLeave);
    }
    return () => {
      if (current) {
        current.removeEventListener('mouseleave', onMouseLeave);
      }
    };
  }, []);

  return (
    <div
      ref={dialogRef}
      className={clsx(s.wrapper, dialogOpen ? s.open : '')}
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
