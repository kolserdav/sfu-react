/******************************************************************************************
 * Repository: https://github.com/kolserdav/webrtc-sfu-node-react.git
 * File name: WarningIcon.tsx
 * Author: Sergey Kolmiller
 * Email: <uyem.ru@gmail.com>
 * License: MIT
 * License text: Show LICENSE file
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Thu Jul 28 2022 22:09:23 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/
import React from 'react';
import Icon, { IconProps } from './Icon';

function WarningIcon(props: Omit<IconProps, 'children'>) {
  return <Icon {...props}>M12,2L1,21H23M12,6L19.53,19H4.47M11,10V14H13V10M11,16V18H13V16</Icon>;
}

export default WarningIcon;
