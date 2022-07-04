/******************************************************************************************
 * Repository: https://github.com/kolserdav/react-node-webrtc-sfu.git
 * File name: ChevronLeftIcon.tsx
 * Author: Sergey Kolmiller
 * Email: <uyem.ru@gmail.com>
 * License: BSD-2-Clause
 * License text: Binary distributions of this software include 'wrtc' and other third-party libraries.
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Mon Jul 04 2022 10:58:51 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/
import React from 'react';
import Icon, { IconProps } from './Icon';

function ChevronLeftIcon(props: Omit<IconProps, 'children'>) {
  return <Icon {...props}>M15.41,16.58L10.83,12L15.41,7.41L14,6L8,12L14,18L15.41,16.58Z</Icon>;
}

export default ChevronLeftIcon;
