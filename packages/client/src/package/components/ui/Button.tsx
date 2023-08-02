/******************************************************************************************
 * Repository: https://github.com/kolserdav/werift-sfu-react.git
 * File name: Button.tsx
 * Author: Sergey Kolmiller
 * Email: <kolserdav@uyem.ru>
 * License: MIT
 * License text: See in LICENSE file
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Wed Aug 02 2023 23:56:49 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/
import React, { useMemo } from 'react';
import { Theme } from '../../Theme';
import s from './Button.module.scss';

function Button(
  props: Omit<
    React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>,
    'type'
    // eslint-disable-next-line react/require-default-props
  > & { theme?: Theme }
) {
  const { theme } = props;
  const _props = useMemo(() => {
    const propsCopy = { ...props };
    delete propsCopy.theme;
    return propsCopy;
  }, [props]);

  return (
    <button
      style={{
        backgroundColor: theme?.colors.text,
        color: theme?.colors.paper,
      }}
      className={s.wrapper}
      type="button"
      {..._props}
    />
  );
}

export default Button;
