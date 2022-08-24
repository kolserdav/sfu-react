/******************************************************************************************
 * Repository: https://github.com/kolserdav/werift-sfu-react.git
 * File name: Theme.context.ts
 * Author: Sergey Kolmiller
 * Email: <uyem.ru@gmail.com>
 * License: MIT
 * License text: See in LICENSE file
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Wed Aug 24 2022 14:14:09 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/
/* eslint-disable no-unused-vars */
import { createContext } from 'react';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { themes } from './Theme';

// eslint-disable-next-line import/prefer-default-export
const ThemeContext = createContext(themes.dark);

export default ThemeContext;
