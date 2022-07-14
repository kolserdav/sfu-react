/******************************************************************************************
 * Repository: https://github.com/kolserdav/react-node-webrtc-sfu.git
 * File name: Icon.tsx
 * Author: Sergey Kolmiller
 * Email: <uyem.ru@gmail.com>
 * License: MIT
 * License text: 
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Thu Jul 14 2022 16:24:49 GMT+0700 (Krasnoyarsk Standard Time)
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
