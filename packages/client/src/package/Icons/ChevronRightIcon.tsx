/******************************************************************************************
 * Repository: https://github.com/kolserdav/webrtc-sfu-node-react.git
 * File name: ChevronRightIcon.tsx
 * Author: Sergey Kolmiller
 * Email: <uyem.ru@gmail.com>
 * License: MIT
 * License text: Show LICENSE file
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Thu Jul 28 2022 22:09:23 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/
import React from 'react';
import Icon, { IconProps } from './Icon';

function ChevronRightIcon(props: Omit<IconProps, 'children'>) {
  return <Icon {...props}>M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z</Icon>;
}

export default ChevronRightIcon;
