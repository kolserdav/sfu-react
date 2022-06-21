/******************************************************************************************
 * Repository: https://github.com/kolserdav/uyem.git
 * File name: Icon.tsx
 * Author: Sergey Kolmiller
 * Email: <uyem.ru@gmail.com>
 * License: BSD-2-Clause
 * License text: Binary distributions of this software include WebRTC and other third-party libraries.
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Tue Jun 21 2022 07:43:56 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/
import React from 'react';

export interface IconProps {
  children: string;
  color?: string;
}

function Icon({ color, children }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      version="1.1"
      width="24px"
      height="24px"
      viewBox="0 0 24 24"
    >
      <path fill={`${color}`} d={children} />
    </svg>
  );
}

Icon.defaultProps = {
  color: '#000',
};

export default Icon;
