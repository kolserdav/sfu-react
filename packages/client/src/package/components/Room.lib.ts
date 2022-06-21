/******************************************************************************************
 * Repository: https://github.com/kolserdav/uyem.git
 * File name: Room.lib.ts
 * Author: Sergey Kolmiller
 * Email: <uyem.ru@gmail.com>
 * License: BSD-2-Clause
 * License text: Binary distributions of this software include 'wrtc' and other third-party libraries.
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Tue Jun 21 2022 08:49:55 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/
import s from './Room.module.scss';
import c from './ui/CloseButton.module.scss';

export const getRoomLink = (roomId: number | string | null): string | null => {
  let res = null;
  if (typeof window !== 'undefined' && roomId) {
    res = `${window.location.href.replace(/\?.*/, '')}?d=${new Date().getTime()}`;
  }
  return res;
};

export const getPathname = (): string | null => {
  let res = null;
  if (typeof window !== 'undefined') {
    res = window.location.pathname;
  }
  return res;
};

export const getWidthOfItem = ({
  lenght,
  container,
  coeff,
}: {
  lenght: number;
  container: HTMLDivElement;
  coeff: number;
}) => {
  let a = 0;
  let dims = {
    cols: 1,
    rows: 1,
  };
  const { width, height } = container.getBoundingClientRect();
  if (lenght) {
    const horizontal = width > height;
    switch (lenght) {
      case 2:
        dims = horizontal ? { cols: 2, rows: 1 } : { cols: 1, rows: 2 };
        break;
      case 3:
        dims = { cols: 2, rows: 2 };
        break;
      case 4:
        dims = { cols: 2, rows: 2 };
        break;
      case 5:
        dims = horizontal ? { cols: 3, rows: 2 } : { cols: 2, rows: 3 };
        break;
      case 6:
        dims = horizontal ? { cols: 3, rows: 2 } : { cols: 2, rows: 3 };
        break;
      default:
      // TODO other counts
    }
    const w = width / dims.cols;
    const h = height / dims.rows;
    a = coeff > 1 ? w : h;
    a = a > width ? width : a > height ? height : a;
  }
  return {
    width: Math.ceil(a),
    cols: dims.cols,
    rows: dims.rows,
  };
};

export const onClickVideo = (e: React.MouseEvent<HTMLVideoElement, MouseEvent>) => {
  const { target }: { target: HTMLVideoElement } = e as any;
  const { videoWidth, videoHeight } = target;
  const { outerWidth } = window;
  const coeff = videoWidth / videoHeight;
  const height = outerWidth / coeff;
  target.parentElement?.classList.add(s.video__fixed);
  target.parentElement?.firstElementChild?.classList.add(c.open);
  target.setAttribute('data', 'full');
  target.setAttribute('width', outerWidth.toString());
  target.setAttribute('height', height.toString());
};
