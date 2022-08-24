import { DialogProps } from '../types';

/******************************************************************************************
 * Repository: https://github.com/kolserdav/werift-sfu-react.git
 * File name: constants.ts
 * Author: Sergey Kolmiller
 * Email: <uyem.ru@gmail.com>
 * License: MIT
 * License text: See in LICENSE file
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Fri Jul 29 2022 21:35:51 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/
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
export const CHAT_TAKE_MESSAGES = 10;
export const TEXT_AREA_MAX_ROWS = 5;
export const DIALOG_DEFAULT: DialogProps = {
  open: false,
  children: '',
  type: 'log',
};
export const DIALOG_TIMEOUT = 2000;
