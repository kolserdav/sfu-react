/******************************************************************************************
 * Repository: https://github.com/kolserdav/uyem.git
 * File name: CloseButton.tsx
 * Author: Sergey Kolmiller
 * Email: <uyem.ru@gmail.com>
 * License: BSD-2-Clause
 * License text: Binary distributions of this software include 'wrtc' and other third-party libraries.
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Tue Jun 21 2022 08:49:55 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/
import React from 'react';
declare function CloseButton({ tabindex, onClick, onKeyDown, }: {
    tabindex: number;
    onClick: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
    onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => void;
}): JSX.Element;
export default CloseButton;
