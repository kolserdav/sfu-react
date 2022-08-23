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

export const scrollToBottom = (element: HTMLDivElement) => {
  element.scrollTo({ top: element.scrollHeight, behavior: 'smooth' });
};
