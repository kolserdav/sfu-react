/******************************************************************************************
 * Repository: https://github.com/kolserdav/webrtc-sfu-node-react.git
 * File name: MicrophoneIcon.tsx
 * Author: Sergey Kolmiller
 * Email: <uyem.ru@gmail.com>
 * License: MIT
 * License text: Show LICENSE file
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Thu Jul 28 2022 22:09:23 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/
import React from 'react';
import Icon, { IconProps } from './Icon';

function MicrophoneIcon(props: Omit<IconProps, 'children'>) {
  return (
    <Icon {...props}>
      M12,2A3,3 0 0,1 15,5V11A3,3 0 0,1 12,14A3,3 0 0,1 9,11V5A3,3 0 0,1 12,2M19,11C19,14.53
      16.39,17.44 13,17.93V21H11V17.93C7.61,17.44 5,14.53 5,11H7A5,5 0 0,0 12,16A5,5 0 0,0 17,11H19Z
    </Icon>
  );
}

export default MicrophoneIcon;
