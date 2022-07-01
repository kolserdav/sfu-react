/******************************************************************************************
 * Repository: https://github.com/kolserdav/uyem.git
 * File name: CopyIcon.tsx
 * Author: Sergey Kolmiller
 * Email: <uyem.ru@gmail.com>
 * License: BSD-2-Clause
 * License text: Binary distributions of this software include 'wrtc' and other third-party libraries.
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Fri Jul 01 2022 17:09:44 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/
import React from 'react';
import Icon, { IconProps } from './Icon';

function CopyIcon(props: Omit<IconProps, 'children'>) {
  return (
    <Icon {...props}>
      M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0
      19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z
    </Icon>
  );
}

export default CopyIcon;
