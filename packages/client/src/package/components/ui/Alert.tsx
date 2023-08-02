/******************************************************************************************
 * Repository: https://github.com/kolserdav/werift-sfu-react.git
 * File name: Alert.tsx
 * Author: Sergey Kolmiller
 * Email: <kolserdav@uyem.ru>
 * License: MIT
 * License text: See in LICENSE file
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Wed Aug 02 2023 23:56:49 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/
import React, { useState, useEffect, useRef, useMemo } from 'react';
import clsx from 'clsx';
import s from './Alert.module.scss';
import { AlertProps } from '../../types';
import { ALERT_TIMEOUT, ALERT_TRANSITION } from '../../utils/constants';
import storeAlert, { changeAlert } from '../../store/alert';
import IconButton from './IconButton';
import CloseIcon from '../../Icons/Close';

function Alert({ children, type, open, theme, infinity }: AlertProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const [mouseMove, setMouseMove] = useState<boolean>(false);
  const [opened, setOpened] = useState<boolean>(false);

  const closeAlert = useMemo(
    () => () => {
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
    },
    [type, children]
  );

  /**
   * Close alert
   */
  useEffect(() => {
    let timeout = setTimeout(() => {
      /** */
    }, 0);
    if (!mouseMove && opened && !infinity) {
      timeout = setTimeout(async () => {
        closeAlert();
      }, ALERT_TIMEOUT);
    }
    return () => {
      clearTimeout(timeout);
    };
  }, [open, mouseMove, closeAlert, opened, infinity]);

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

  const color = useMemo(
    () => (type === 'warn' || type === 'error' ? theme?.colors.black : theme?.colors.white),
    []
  );

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
        color,
        display: open ? 'flex' : 'none',
      }}
    >
      <div className={s.text}>{children}</div>
      <div className={s.closeNutton}>
        <IconButton onClick={closeAlert}>
          <CloseIcon color={color} />
        </IconButton>
      </div>
    </div>
  );
}

export default Alert;
