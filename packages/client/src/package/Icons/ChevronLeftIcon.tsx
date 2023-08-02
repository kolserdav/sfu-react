/******************************************************************************************
 * Repository: https://github.com/kolserdav/werift-sfu-react.git
 * File name: ChevronLeftIcon.tsx
 * Author: Sergey Kolmiller
 * Email: <kolserdav@uyem.ru>
 * License: MIT
 * License text: See in LICENSE file
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Wed Aug 02 2023 23:56:49 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/
import React from 'react';
import Icon, { IconProps } from './Icon';

function ChevronLeftIcon(props: Omit<IconProps, 'children'>) {
  return <Icon {...props}>M15.41,16.58L10.83,12L15.41,7.41L14,6L8,12L14,18L15.41,16.58Z</Icon>;
}

export default ChevronLeftIcon;
