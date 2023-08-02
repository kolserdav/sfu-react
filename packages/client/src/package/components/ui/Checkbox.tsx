/******************************************************************************************
 * Repository: https://github.com/kolserdav/werift-sfu-react.git
 * File name: Checkbox.tsx
 * Author: Sergey Kolmiller
 * Email: <kolserdav@uyem.ru>
 * License: MIT
 * License text: See in LICENSE file
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Wed Aug 02 2023 23:56:49 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/
import React, { useMemo } from 'react';
import { v4 } from 'uuid';
import s from './Checkbox.module.scss';

function Checkbox(
  props: React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>
) {
  const { children } = props;
  const id = useMemo(() => v4(), []);
  const _props = useMemo(() => {
    const __props = { ...props };
    delete __props.children;
    return __props;
  }, [props]);
  return (
    <div className={s.wrapper}>
      <input {..._props} id={id} type="checkbox" />
      <label htmlFor={id}>{children}</label>
    </div>
  );
}

export default Checkbox;
