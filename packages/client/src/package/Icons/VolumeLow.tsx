/******************************************************************************************
 * Repository: https://github.com/kolserdav/werift-sfu-react.git
 * File name: VolumeLow.tsx
 * Author: Sergey Kolmiller
 * Email: <kolserdav@uyem.ru>
 * License: MIT
 * License text: See in LICENSE file
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Wed Aug 02 2023 23:56:49 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/
import React from 'react';
import Icon, { IconProps } from './Icon';

function VolumeLowIcon(props: Omit<IconProps, 'children'>) {
  return <Icon {...props}>M7,9V15H11L16,20V4L11,9H7Z</Icon>;
}

export default VolumeLowIcon;
