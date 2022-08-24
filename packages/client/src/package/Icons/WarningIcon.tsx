/******************************************************************************************
 * Repository: https://github.com/kolserdav/werift-sfu-react.git
 * File name: WarningIcon.tsx
 * Author: Sergey Kolmiller
 * Email: <uyem.ru@gmail.com>
 * License: MIT
 * License text: See in LICENSE file
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Wed Aug 24 2022 14:14:09 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/
import React from 'react';
import Icon, { IconProps } from './Icon';

function WarningIcon(props: Omit<IconProps, 'children'>) {
  return <Icon {...props}>M12,2L1,21H23M12,6L19.53,19H4.47M11,10V14H13V10M11,16V18H13V16</Icon>;
}

export default WarningIcon;
