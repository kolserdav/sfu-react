/******************************************************************************************
 * Repository: https://github.com/kolserdav/werift-sfu-react.git
 * File name: Chat.lib.ts
 * Author: Sergey Kolmiller
 * Email: <uyem.ru@gmail.com>
 * License: MIT
 * License text: See in LICENSE file
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Wed Aug 24 2022 14:14:09 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/

import { MessageFull } from '../types/interfaces';
import { log } from '../utils/lib';
import { SHORT_MESS_LENGTH } from '../utils/constants';
import s from './Chat.module.scss';

const quoteRegex = /\[quote=.+\]/;

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

const prepareQuotes = (text: string) => {
  let _text = text.slice();
  const quote = text.match(quoteRegex);
  if (quote) {
    const _quote = quote[0];
    const { id, name, shortMess } = parseQuoteContext(
      _quote.replace('[quote=', '').replace(/\]$/, '')
    );
    if (!id) {
      log('error', 'Error get quote', { id, _quote });
      return text;
    }
    _text = _text.replace(
      _quote,
      `<a class="${s.quote__link}" href="#${id}"><div class="${s.quote}"><div class="${s.name}">${name}</div><div className="${s.text}">${shortMess}</div></div></a>`
    );
  }
  return _text;
};

// eslint-disable-next-line import/prefer-default-export
export const prepareMessage = (text: string) =>
  prepareQuotes(prepareLinks(text.replace(/\n/g, '<br>')));

export const scrollTo = (element: HTMLDivElement, clientY: number) => {
  element.scrollTo({ top: clientY, behavior: 'smooth' });
};

export const scrollToBottom = (element: HTMLDivElement) => {
  scrollTo(element, element.scrollHeight);
};

export const scrollToTop = (element: HTMLDivElement) => {
  scrollTo(element, 1);
};

const getShortMess = (text: string) => {
  let result = '';
  const _text = text.replace(quoteRegex, '');
  for (let i = 0; i < SHORT_MESS_LENGTH && _text[i]; i++) {
    result += _text[i];
  }
  if (_text.length > result.length) {
    result += ' ...';
  }
  return result;
};

export const cleanQuote = (text: string) => text.replace(quoteRegex, '');

export const getQuoteContext = (item: MessageFull) =>
  JSON.stringify({ id: item.id, name: item.Unit.name, shortMess: getShortMess(item.text) });

export const checkQuote = (text: string) => {
  const quote = text.match(quoteRegex);
  let length = 0;
  if (quote) {
    length = quote[0].length;
  }
  return length;
};

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
