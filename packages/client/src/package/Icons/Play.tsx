/******************************************************************************************
 * Repository: https://github.com/kolserdav/werift-sfu-react.git
 * File name: Play.tsx
 * Author: Sergey Kolmiller
 * Email: <uyem.ru@gmail.com>
 * License: MIT
 * License text: See in LICENSE file
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Wed Aug 24 2022 14:14:09 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/
import React from 'react';
import Icon, { IconProps } from './Icon';

function PlayIcon(props: Omit<IconProps, 'children'>) {
  return <Icon {...props}>M8,5.14V19.14L19,12.14L8,5.14Z</Icon>;
}

export default PlayIcon;
