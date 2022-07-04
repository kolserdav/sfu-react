/******************************************************************************************
 * Repository: https://github.com/kolserdav/react-node-webrtc-sfu.git
 * File name: Main.lib.ts
 * Author: Sergey Kolmiller
 * Email: <uyem.ru@gmail.com>
 * License: BSD-2-Clause
 * License text: Binary distributions of this software include 'wrtc' and other third-party libraries.
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Mon Jul 04 2022 10:58:51 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/
import { Colors, Themes } from './Theme';

// eslint-disable-next-line import/prefer-default-export
export const changeColors = ({
  colors,
  themes,
}: {
  colors: Colors | undefined;
  themes: Themes;
}) => {
  const _themes = { ...themes };
  if (colors) {
    _themes.dark.colors = colors.dark;
    _themes.light.colors = colors.light;
  }
  return _themes;
};
