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
import {
  AlertProps,
  ClickPosition,
  DialogProps,
  DialogPropsDefaultContext,
  DialogPropsUsersContext,
} from '../types';
import { LogLevel } from '../types/interfaces';

export const LOG_LEVEL: LogLevel = parseInt(process.env.REACT_APP_LOG_LEVEL as string, 10);
export const IS_DEV = process.env.NODE_ENV === 'development';
export const WS_TTL = 1;
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
export const SPEAKER_LEVEL = 0.5;
export const CHAT_TAKE_MESSAGES = 10;
export const TEXT_AREA_MAX_ROWS = 5;
export const TEXT_AREA_ROW_LENGTH = 60;
export const ALERT_DEFAULT: AlertProps = {
  open: false,
  children: '',
  type: 'log',
};
export const ALERT_TIMEOUT = 3000;
export const CONTEXT_DEFAULT = { unitId: '0', id: 0, text: '', isOwner: false };
export const DIALOG_DEFAULT: DialogProps<DialogPropsDefaultContext & DialogPropsUsersContext> = {
  open: false,
  children: '',
  clientX: 0,
  clientY: 0,
  width: 0,
  height: 0,
  context: CONTEXT_DEFAULT,
  secure: false,
};
export const CLICK_POSITION_DEFAULT: ClickPosition = {
  clientX: 0,
  clientY: 0,
};
export const DIALOG_VOLUME_DIMENSION = {
  width: 40,
  height: 150,
};
export const DIALOG_MESSAGE_DIMENSION = {
  width: 150,
  height: 150,
};
export const DIALOG_SETTINGS_DIMENSION = {
  width: 120,
  height: 180,
};
export const DIALOG_USER_DIMENSION = {
  width: 120,
  height: 100,
};
export const SHORT_MESS_LENGTH = 30;
export const FIRST_MESSAGE_INDENT = 20;
export const FOLOW_QUOTE_STYLE = 'border: 3px solid lightblue';
export const USER_NAME_DEFAULT = 'No Name';
export const VOLUME_MIN = 10;
// dependency $alert-transition packages/client/src/package/Main.scss
export const ALERT_TRANSITION = 350;
export const VIDEO_ACTIONS_STYLE = 'right: calc(1rem - 10px);transition: top 0.3s ease-in';
export const PSEUDO_BUTTON_ANIMATION_TIMEOUT = 1000;
export const VIDEO_STARTED_HOOK_TIMEOUT = 3000;
export const RECORDED_VIDEO_TAKE_DEFAULT = 2;
export const MOBILE_WIDTH = 760;
// dependency packages/client/src/package/components/Chat.module.scss $text-area-padding-left
export const TEXT_AREA_PADDING_LEFT = 16;
// dependency to five  packages/client/src/package/components/Chat.module.scss $text-area-border-width
export const TEXT_AREA_BORDER_WIDTH = 5;
// in prod is strong of 0, other values only for test on development
// eslint-disable-next-line @typescript-eslint/prefer-as-const
export const ROOM_LENGTH_TEST: 0 = 0;
export const CHANGE_SPEAKER_SORT_TIMEOUT = 8000;
export const USERS_ICON_WIDTH = 24;
export const USERS_ICON_WIDTH_BIG = 30;
export const MAX_VIDEO_STREAMS = 4;
export const PLAY_VIDEO_TIMEOUT = 30000;
