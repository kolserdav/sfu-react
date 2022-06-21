/******************************************************************************************
 * Repository: https://github.com/kolserdav/uyem.git
 * File name: Main.context.ts
 * Author: Sergey Kolmiller
 * Email: <uyem.ru@gmail.com>
 * License: BSD-2-Clause
 * License text: Binary distributions of this software include WebRTC and other third-party libraries.
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Tue Jun 21 2022 07:43:56 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/
import { createContext } from 'react';
import clsx from 'clsx';
import s from './Main.module.scss';
import { ThemeType } from './types';

export type Themes = {
  dark: Theme;
  light: Theme;
};

interface Color {
  paper: string;
  text: string;
  shadow: string;
}

type Colors = {
  light: Color;
  dark: Color;
};

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
    text: '#d7d6d6',
    shadow: '#beb2c8',
  },
  light: {
    paper: '#fff',
    text: '#5d5e60',
    shadow: '#8d8d92',
  },
};

export const themes: Themes = {
  dark: {
    wrapper: {
      backgroundColor: colors.dark.paper,
      color: colors.light.text,
    },
    container: {
      backgroundColor: colors.light.text,
      color: colors.light.paper,
    },
    button: {
      backgroundColor: colors.light.shadow,
      color: colors.dark.text,
    },
    link: {
      color: colors.light.paper,
    },
    colors: colors.dark,
  },
  light: {
    wrapper: {
      backgroundColor: colors.light.paper,
      color: colors.dark.text,
    },
    container: {
      backgroundColor: colors.dark.text,
      color: colors.dark.paper,
    },
    button: {
      backgroundColor: colors.dark.shadow,
      color: colors.light.text,
    },
    link: {
      color: colors.dark.paper,
    },
    colors: colors.light,
  },
};

// eslint-disable-next-line import/prefer-default-export
export const ThemeContext = createContext(themes.dark);
