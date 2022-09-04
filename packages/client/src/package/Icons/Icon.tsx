/******************************************************************************************
 * Repository: https://github.com/kolserdav/werift-sfu-react.git
 * File name: Icon.tsx
 * Author: Sergey Kolmiller
 * Email: <uyem.ru@gmail.com>
 * License: MIT
 * License text: See in LICENSE file
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Wed Aug 24 2022 14:14:09 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/
import React from 'react';

export interface IconProps {
  children: string;
  width?: number;
  height?: number;
  color?: string;
  className?: string;
}

function Icon({ color, children, width, height, className }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      version="1.1"
      width={`${width}px`}
      height={`${height}px`}
      viewBox="0 0 24 24"
      className={className}
    >
      <path fill={`${color}`} d={children} />
    </svg>
  );
}

Icon.defaultProps = {
  color: '#000',
  width: 24,
  height: 24,
  className: '',
};

export default Icon;
