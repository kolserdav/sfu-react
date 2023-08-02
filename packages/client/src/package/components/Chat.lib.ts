/******************************************************************************************
 * Repository: https://github.com/kolserdav/werift-sfu-react.git
 * File name: Chat.lib.ts
 * Author: Sergey Kolmiller
 * Email: <kolserdav@uyem.ru>
 * License: MIT
 * License text: See in LICENSE file
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Wed Aug 02 2023 23:56:49 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/

import { MessageFull } from '../types/interfaces';
import { log } from '../utils/lib';
import { SHORT_MESS_LENGTH } from '../utils/constants';
import s from './Chat.module.scss';

const prepareLinks = (text: string) => {
  let _text = text.slice();
  const links = text.match(/https?:\/\/[a-zA-Z.-_0-9/]+/g);
  links?.forEach((item) => {
    _text = _text.replace(
      item,
      `<a target="_blank" href="${item.replace(/<br>/g, '')}">${item}</a>`
    );
  });
  return _text;
};

// eslint-disable-next-line import/prefer-default-export
export const prepareMessage = (text: string) => prepareLinks(text.replace(/\n/g, '<br>'));

export const scrollTo = (element: HTMLDivElement, clientY: number) => {
  element.scrollTo({ top: clientY, behavior: 'smooth' });
};

export const scrollToBottom = (element: HTMLDivElement) => {
  scrollTo(element, element.scrollHeight);
};

export const scrollToTop = (element: HTMLDivElement) => {
  scrollTo(element, 1);
};

export const getShortMess = (text: string) => {
  let result = '';
  for (let i = 0; i < SHORT_MESS_LENGTH && text[i]; i++) {
    result += text[i];
  }
  if (text.length > result.length) {
    result += ' ...';
  }
  return result;
};

export const getQuoteContext = (item: MessageFull) =>
  JSON.stringify({ id: item.id, name: item.Unit.name, shortMess: getShortMess(item.text) });

export const parseQuoteContext = (
  text: string
): {
  id: number;
  name: string;
  shortMess: string;
} => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let result: any = {};
  try {
    result = JSON.parse(text);
  } catch (e) {
    log('error', 'Error parse quote', e);
  }
  return result;
};

export const gettextAreaRows = (value: string) => {
  let c = 1;
  for (let i = 0; value[i]; i++) {
    if (value[i] === '\n') {
      c++;
    }
  }
  return c;
};
