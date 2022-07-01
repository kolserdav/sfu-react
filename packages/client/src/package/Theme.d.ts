/// <reference types="react" />
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
export declare type Themes = {
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
export interface Theme {
    wrapper: React.CSSProperties;
    container: React.CSSProperties;
    button: React.CSSProperties;
    link: React.CSSProperties;
    colors: Colors[ThemeType];
}
export declare const themes: Themes;
