/******************************************************************************************
 * Repository: https://github.com/kolserdav/webrtc-sfu-node-react.git
 * File name: Main.lib.ts
 * Author: Sergey Kolmiller
 * Email: <uyem.ru@gmail.com>
 * License: MIT
 * License text: Show LICENSE file
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Thu Jul 28 2022 22:09:23 GMT+0700 (Krasnoyarsk Standard Time)
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
