/******************************************************************************************
 * Repository: https://github.com/kolserdav/uyem.git
 * File name: IconButton.tsx
 * Author: Sergey Kolmiller
 * Email: <uyem.ru@gmail.com>
 * License: BSD-2-Clause
 * License text: Binary distributions of this software include 'wrtc' and other third-party libraries.
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Fri Jul 01 2022 17:09:44 GMT+0700 (Krasnoyarsk Standard Time)
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
