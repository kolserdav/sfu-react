/******************************************************************************************
 * Repository: https://github.com/kolserdav/werift-sfu-react.git
 * File name: IconButton.tsx
 * Author: Sergey Kolmiller
 * Email: <kolserdav@uyem.ru>
 * License: MIT
 * License text: See in LICENSE file
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Wed Aug 02 2023 23:56:49 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React from 'react';
import clsx from 'clsx';
import s from './IconButton.module.scss';

function IconButton({
  children,
  className,
  width,
  title,
  height,
  strict,
  onClick,
  disabled,
  id,
}: {
  children: JSX.Element;
  title?: string;
  width?: number;
  height?: number;
  className?: string;
  strict?: boolean;
  onClick?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  disabled?: boolean;
  id?: string;
}) {
  return (
    <div
      id={id}
      onClick={
        disabled
          ? () => {
              /** */
            }
          : onClick
      }
      role="button"
      title={title}
      tabIndex={0}
      className={clsx(
        !strict ? s.wrapper : className,
        strict ? '' : className,
        disabled ? s.disabled : ''
      )}
    >
      {children}
    </div>
  );
}
IconButton.defaultProps = {
  className: s.wrapper,
  width: 40,
  height: 40,
  title: '',
  strict: false,
  id: undefined,
  onClick: () => {
    /** */
  },
  disabled: false,
};

export default IconButton;
