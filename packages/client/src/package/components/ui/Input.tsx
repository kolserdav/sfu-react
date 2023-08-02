/******************************************************************************************
 * Repository: https://github.com/kolserdav/werift-sfu-react.git
 * File name: Input.tsx
 * Author: Sergey Kolmiller
 * Email: <kolserdav@uyem.ru>
 * License: MIT
 * License text: See in LICENSE file
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Wed Aug 02 2023 23:56:49 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/
import React, { useMemo } from 'react';
import { Theme } from '../../Theme';
import s from './Input.module.scss';

function Input(
  props: React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> & {
    // eslint-disable-next-line react/require-default-props
    theme?: Theme;
  }
) {
  const { theme } = props;
  const _props = useMemo(() => {
    const propsCopy = { ...props };
    delete propsCopy.theme;
    return propsCopy;
  }, [props]);

  return (
    <input
      className={s.wrapper}
      {..._props}
      style={{ backgroundColor: theme?.colors.text, color: theme?.colors.paper }}
    />
  );
}

export default Input;
