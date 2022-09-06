/******************************************************************************************
 * Repository: https://github.com/kolserdav/werift-sfu-react.git
 * File name: Alert.tsx
 * Author: Sergey Kolmiller
 * Email: <uyem.ru@gmail.com>
 * License: MIT
 * License text: See in LICENSE file
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Wed Aug 24 2022 14:14:09 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/
import React, { useState, useEffect, useRef } from 'react';
import clsx from 'clsx';
import s from './Alert.module.scss';
import { AlertProps } from '../../types';
import { ALERT_TIMEOUT, ALERT_TRANSITION } from '../../utils/constants';
import storeAlert, { changeAlert } from '../../store/alert';

function Alert({ children, type, open, theme }: AlertProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const [mouseMove, setMouseMove] = useState<boolean>(false);
  const [opened, setOpened] = useState<boolean>(false);

  /**
   * Close alert
   */
  useEffect(() => {
    let timeout = setTimeout(() => {
      /** */
    }, 0);
    if (!mouseMove && opened) {
      timeout = setTimeout(async () => {
        setOpened(false);
        setTimeout(() => {
          storeAlert.dispatch(
            changeAlert({
              alert: {
                open: false,
                type,
                children,
              },
            })
          );
        }, ALERT_TRANSITION);
      }, ALERT_TIMEOUT);
    }
    return () => {
      clearTimeout(timeout);
    };
  }, [open, mouseMove, children, type, opened]);

  useEffect(() => {
    if (open) {
      setOpened(true);
    }
  }, [open]);

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
      className={clsx(s.wrapper, opened ? s.open : '')}
      style={{
        background:
          type === 'error'
            ? theme?.colors.red
            : type === 'warn'
            ? theme?.colors.yellow
            : theme?.colors.blue,
        color: theme?.colors.text,
        display: open ? 'flex' : 'none',
      }}
    >
      {children}
    </div>
  );
}

export default Alert;
