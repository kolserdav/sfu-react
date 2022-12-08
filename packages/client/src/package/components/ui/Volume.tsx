/******************************************************************************************
 * Repository: https://github.com/kolserdav/werift-sfu-react.git
 * File name: Volume.tsx
 * Author: Sergey Kolmiller
 * Email: <uyem.ru@gmail.com>
 * License: MIT
 * License text: See in LICENSE file
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Fri Dec 09 2022 05:47:21 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/
import React from 'react';
import s from './Volume.module.scss';

function Volume(
  props: Omit<
    React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>,
    'className' | 'type' | 'min' | 'max'
  >
) {
  return <input {...props} className={s.wrapper} type="range" min="0" max="100" />;
}

export default Volume;
