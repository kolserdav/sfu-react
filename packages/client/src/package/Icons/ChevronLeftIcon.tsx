/******************************************************************************************
 * Repository: https://github.com/kolserdav/webrtc-sfu-node-react.git
 * File name: ChevronLeftIcon.tsx
 * Author: Sergey Kolmiller
 * Email: <uyem.ru@gmail.com>
 * License: MIT
 * License text: Show LICENSE file
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Thu Jul 28 2022 22:09:23 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/
import React from 'react';
import Icon, { IconProps } from './Icon';

function ChevronLeftIcon(props: Omit<IconProps, 'children'>) {
  return <Icon {...props}>M15.41,16.58L10.83,12L15.41,7.41L14,6L8,12L14,18L15.41,16.58Z</Icon>;
}

export default ChevronLeftIcon;
