/******************************************************************************************
 * Repository: https://github.com/kolserdav/uyem.git
 * File name: Theme.ts
 * Author: Sergey Kolmiller
 * Email: <uyem.ru@gmail.com>
 * License: BSD-2-Clause
 * License text: Binary distributions of this software include 'wrtc' and other third-party libraries.
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Tue Jun 21 2022 08:49:55 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/
import { ThemeType } from './types';

export type Themes = {
  dark: Theme;
  light: Theme;
};

export interface Color {
  paper: string;
  text: string;
  active: string;
}

type Colors = {
  light: Color;
  dark: Color;
};

// Additionals
type Theme = {
  wrapper: React.CSSProperties;
  container: React.CSSProperties;
  button: React.CSSProperties;
  link: React.CSSProperties;
  colors: Colors[ThemeType];
};

const colors: Colors = {
  dark: {
    paper: '#36413e',
    text: '#5d5e60',
    active: '#8d8d92',
  },
  light: {
    paper: '#fff',
    text: '#d7d6d6',
    active: '#beb2c8',
  },
};

export const themes: Themes = {
  dark: {
    wrapper: {
      backgroundColor: colors.dark.paper,
      color: colors.light.text,
    },
    container: {
      backgroundColor: colors.dark.active,
      color: colors.light.paper,
    },
    button: {
      backgroundColor: colors.light.active,
      color: colors.dark.text,
    },
    link: {
      color: colors.light.paper,
    },
    colors: colors.light,
  },
  light: {
    wrapper: {
      backgroundColor: colors.light.paper,
      color: colors.dark.text,
    },
    container: {
      backgroundColor: colors.light.active,
      color: colors.dark.paper,
    },
    button: {
      backgroundColor: colors.dark.active,
      color: colors.light.text,
    },
    link: {
      color: colors.dark.paper,
    },
    colors: colors.dark,
  },
};
