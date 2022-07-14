/******************************************************************************************
 * Repository: https://github.com/kolserdav/react-node-webrtc-sfu.git
 * File name: IconButton.tsx
 * Author: Sergey Kolmiller
 * Email: <uyem.ru@gmail.com>
 * License: MIT
 * License text: 
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Thu Jul 14 2022 16:24:49 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React from 'react';
import s from './IconButton.module.scss';

function IconButton({
  children,
  className,
  width,
  height,
  onClick,
}: {
  children: JSX.Element;
  width?: number;
  height?: number;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
}) {
  return (
    <div
      style={{ width, height }}
      onClick={onClick}
      role="button"
      tabIndex={0}
      className={className}
    >
      {children}
    </div>
  );
}
IconButton.defaultProps = {
  className: s.wrapper,
  width: 40,
  height: 40,
  onClick: () => {
    /** */
  },
};

export default IconButton;
