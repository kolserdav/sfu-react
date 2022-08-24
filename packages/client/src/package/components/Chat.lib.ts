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

import { log } from '../utils/lib';

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
  const quote = text.match(/\[quote=\d+\]/);
  if (quote) {
    const _quote = quote[0];
    const id = _quote.match(/\d+/);
    if (!id) {
      log('error', 'Error get quote', { id, _quote });
      return text;
    }
    _text = _text.replace(_quote, `| Message ${id[0]}`);
  }
  return _text;
};

// eslint-disable-next-line import/prefer-default-export
export const prepareMessage = (text: string) =>
  prepareQuotes(prepareLinks(text.replace(/\n/g, '<br>')));

export const scrollToBottom = (element: HTMLDivElement) => {
  element.scrollTo({ top: element.scrollHeight, behavior: 'smooth' });
};
