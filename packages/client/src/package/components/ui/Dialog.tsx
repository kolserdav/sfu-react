/******************************************************************************************
 * Repository: https://github.com/kolserdav/werift-sfu-react.git
 * File name: Dialog.tsx
 * Author: Sergey Kolmiller
 * Email: <uyem.ru@gmail.com>
 * License: MIT
 * License text: See in LICENSE file
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Wed Nov 23 2022 15:23:26 GMT+0700 (Krasnoyarsk Standard Time)
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
