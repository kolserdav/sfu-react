import { createContext } from 'react';
import clsx from 'clsx';
import s from './Main.module.scss';

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
  wrapper: string;
  button: string;
  colors: Colors['light' | 'dark'];
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
    wrapper: clsx(s.wrapper, s.dark),
    button: clsx(s.button, s.dark),
    colors: colors.light,
  },
  light: {
    wrapper: clsx(s.wrapper, s.light),
    button: clsx(s.button, s.light),
    colors: colors.dark,
  },
};

// eslint-disable-next-line import/prefer-default-export
export const ThemeContext = createContext(themes.dark);
