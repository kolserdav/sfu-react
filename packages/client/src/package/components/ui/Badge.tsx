/******************************************************************************************
 * Repository: https://github.com/kolserdav/werift-sfu-react.git
 * File name: Badge.tsx
 * Author: Sergey Kolmiller
 * Email: <uyem.ru@gmail.com>
 * License: MIT
 * License text: See in LICENSE file
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Wed Nov 23 2022 15:23:26 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/
import React from 'react';
import { Theme } from '../../Theme';
import s from './Badge.module.scss';

function Badge({
  children,
  value,
  theme,
  title,
}: {
  children: React.ReactNode;
  value: number | string;
  theme: Theme;
  title?: string;
}) {
  return (
    <div className={s.wrapper} title={title}>
      {children}
      <div
        className={s.value}
        style={{ backgroundColor: theme.colors.active, color: theme.colors.text }}
      >
        <span className={s.text}>{value}</span>
      </div>
    </div>
  );
}

Badge.defaultProps = {
  title: '',
};

export default Badge;
