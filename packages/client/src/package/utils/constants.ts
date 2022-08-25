/******************************************************************************************
 * Repository: https://github.com/kolserdav/werift-sfu-react.git
 * File name: constants.ts
 * Author: Sergey Kolmiller
 * Email: <uyem.ru@gmail.com>
 * License: MIT
 * License text: See in LICENSE file
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Wed Aug 24 2022 14:14:09 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/
import { AlertProps, ClickPosition, DialogProps } from '../types';

export const WS_TTL = 1;
export const LOG_LEVEL = 2;
export const START_DELAY = 1999;
export const CODECS = [
  'video/webm;codecs=H264',
  'video/webm;codecs=vp8',
  'video/webm;codecs=vp9',
  'video/webm;codecs=vp8.0',
  'video/webm;codecs=vp9.0',
  'video/webm;codecs=h264',
  'video/webm;codecs=avc1',
  'video/webm;codecs=vp8,opus',
  'video/WEBM;codecs=VP8,OPUS',
  'video/webm;codecs=vp9,opus',
  'video/webm;codecs=vp8,vp9,opus',
  'video/webm;codecs=h264,opus',
  'video/webm;codecs=h264,vp9,opus',
  'video/x-matroska;codecs=avc1',
];
export const SPEAKER_LEVEL = 0.4;
export const CHAT_TAKE_MESSAGES = 20;
export const TEXT_AREA_MAX_ROWS = 5;
export const ALERT_DEFAULT: AlertProps = {
  open: false,
  children: '',
  type: 'log',
};
export const ALERT_TIMEOUT = 3000;
export const DIALOG_DEFAULT: DialogProps = {
  open: false,
  children: '',
  clientX: 0,
  clientY: 0,
  context: 0,
};
export const CLICK_POSITION_DEFAULT: ClickPosition = {
  clientX: 0,
  clientY: 0,
  context: 0,
};
