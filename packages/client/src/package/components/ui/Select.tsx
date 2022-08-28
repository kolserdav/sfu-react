/******************************************************************************************
 * Repository: https://github.com/kolserdav/werift-sfu-react.git
 * File name: Select.tsx
 * Author: Sergey Kolmiller
 * Email: <uyem.ru@gmail.com>
 * License: MIT
 * License text: See in LICENSE file
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Wed Aug 24 2022 14:14:09 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/
import React, { useContext } from 'react';
import { LocaleSelector } from '../../types/interfaces';
import ThemeContext from '../../Theme.context';
import s from './Select.module.scss';

function Select({
  value,
  children,
  onChange,
}: {
  value: string;
  children: typeof LocaleSelector;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}) {
  const theme = useContext(ThemeContext);
  return (
    <select
      className={s.wrapper}
      onChange={onChange}
      value={value}
      style={{ background: theme.colors.active, color: theme.colors.text }}
    >
      {children.map((item) => (
        <option key={item.value} disabled={!item.impl} value={item.value}>
          {item.name}
        </option>
      ))}
    </select>
  );
}

export default Select;
