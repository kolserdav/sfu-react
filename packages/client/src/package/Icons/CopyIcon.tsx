/******************************************************************************************
 * Repository: https://github.com/kolserdav/webrtc-sfu-werift-react.git
 * File name: CopyIcon.tsx
 * Author: Sergey Kolmiller
 * Email: <uyem.ru@gmail.com>
 * License: MIT
 * License text: Show LICENSE file
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Thu Jul 28 2022 22:20:46 GMT+0700 (Krasnoyarsk Standard Time)
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
