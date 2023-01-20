import React from 'react';
import Icon, { IconProps } from './Icon';

function PauseIcon(props: Omit<IconProps, 'children'>) {
  return <Icon {...props}>M14,19H18V5H14M6,19H10V5H6V19Z</Icon>;
}

export default PauseIcon;
