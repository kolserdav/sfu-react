/******************************************************************************************
 * Repository: https://github.com/kolserdav/uyem.git
 * File name: IconButton.tsx
 * Author: Sergey Kolmiller
 * Email: <uyem.ru@gmail.com>
 * License: BSD-2-Clause
 * License text: Binary distributions of this software include 'wrtc' and other third-party libraries.
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Tue Jun 21 2022 08:49:55 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/
import React from 'react';
declare function IconButton({ children, className, width, height, onClick, }: {
    children: JSX.Element;
    width?: number;
    height?: number;
    className?: string;
    onClick?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
}): JSX.Element;
declare namespace IconButton {
    var defaultProps: {
        className: string;
        width: number;
        height: number;
        onClick: () => void;
    };
}
export default IconButton;
