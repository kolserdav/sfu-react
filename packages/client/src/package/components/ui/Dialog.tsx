/******************************************************************************************
 * Repository: https://github.com/kolserdav/werift-sfu-react.git
 * File name: Dialog.tsx
 * Author: Sergey Kolmiller
 * Email: <kolserdav@uyem.ru>
 * License: MIT
 * License text: See in LICENSE file
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Wed Aug 02 2023 23:56:49 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/
import React from 'react';
import s from './Dialog.module.scss';
import { DialogProps } from '../../types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function Dialog({ open, children, clientY, clientX, theme, width, height }: DialogProps<any>) {
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
