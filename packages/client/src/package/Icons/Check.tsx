/******************************************************************************************
 * Repository: https://github.com/kolserdav/werift-sfu-react.git
 * File name: Check.tsx
 * Author: Sergey Kolmiller
 * Email: <kolserdav@uyem.ru>
 * License: MIT
 * License text: See in LICENSE file
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Wed Aug 02 2023 23:56:49 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/
import React from 'react';
import Icon, { IconProps } from './Icon';

function CheckIcon(props: Omit<IconProps, 'children'>) {
  return <Icon {...props}>M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z</Icon>;
}

export default CheckIcon;
