/******************************************************************************************
 * Repository: https://github.com/kolserdav/werift-sfu-react.git
 * File name: Pause.tsx
 * Author: Sergey Kolmiller
 * Email: <kolserdav@uyem.ru>
 * License: MIT
 * License text: See in LICENSE file
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Wed Aug 02 2023 23:56:49 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/
import React from 'react';
import Icon, { IconProps } from './Icon';

function PauseIcon(props: Omit<IconProps, 'children'>) {
  return <Icon {...props}>M14,19H18V5H14M6,19H10V5H6V19Z</Icon>;
}

export default PauseIcon;
