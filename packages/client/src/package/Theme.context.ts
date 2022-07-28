/******************************************************************************************
 * Repository: https://github.com/kolserdav/webrtc-sfu-node-react.git
 * File name: Theme.context.ts
 * Author: Sergey Kolmiller
 * Email: <uyem.ru@gmail.com>
 * License: MIT
 * License text: Show LICENSE file
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Thu Jul 28 2022 22:09:23 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/
/* eslint-disable no-unused-vars */
import { createContext } from 'react';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { themes } from './Theme';

// eslint-disable-next-line import/prefer-default-export
const ThemeContext = createContext(themes.dark);

export default ThemeContext;
