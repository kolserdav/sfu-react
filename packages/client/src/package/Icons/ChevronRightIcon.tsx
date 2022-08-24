/******************************************************************************************
 * Repository: https://github.com/kolserdav/werift-sfu-react.git
 * File name: ChevronRightIcon.tsx
 * Author: Sergey Kolmiller
 * Email: <uyem.ru@gmail.com>
 * License: MIT
 * License text: See in LICENSE file
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Wed Aug 24 2022 14:14:09 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/
import React from 'react';
import Icon, { IconProps } from './Icon';

function ChevronRightIcon(props: Omit<IconProps, 'children'>) {
  return <Icon {...props}>M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z</Icon>;
}

export default ChevronRightIcon;
