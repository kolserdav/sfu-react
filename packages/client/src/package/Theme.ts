/******************************************************************************************
 * Repository: https://github.com/kolserdav/uyem.git
 * File name: Theme.ts
 * Author: Sergey Kolmiller
 * Email: <uyem.ru@gmail.com>
 * License: BSD-2-Clause
 * License text: Binary distributions of this software include 'wrtc' and other third-party libraries.
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Fri Jul 01 2022 17:09:44 GMT+0700 (Krasnoyarsk Standard Time)
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

export interface Colors {
  light: Color;
  dark: Color;
}

// Additionals
export interface Theme {
  wrapper: React.CSSProperties;
  container: React.CSSProperties;
  button: React.CSSProperties;
  link: React.CSSProperties;
  colors: Colors[ThemeType];
}

const colors: Colors = {
  dark: {
    paper: '#36413e',
    text: '#d7d6d6',
    active: '#beb2c8',
  },
  light: {
    paper: '#fff',
    text: '#5d5e60',
    active: '#8d8d92',
  },
};

export const themes: Themes = {
  dark: {
    wrapper: {
      backgroundColor: colors.dark.paper,
      color: colors.dark.text,
    },
    container: {
      backgroundColor: colors.light.active,
      color: colors.light.paper,
    },
    button: {
      backgroundColor: colors.dark.active,
      color: colors.light.text,
    },
    link: {
      color: colors.light.paper,
    },
    colors: colors.dark,
  },
  light: {
    wrapper: {
      backgroundColor: colors.light.paper,
      color: colors.light.text,
    },
    container: {
      backgroundColor: colors.dark.active,
      color: colors.dark.paper,
    },
    button: {
      backgroundColor: colors.light.active,
      color: colors.dark.text,
    },
    link: {
      color: colors.dark.paper,
    },
    colors: colors.light,
  },
};
