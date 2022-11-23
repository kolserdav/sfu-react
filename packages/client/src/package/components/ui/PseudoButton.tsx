/******************************************************************************************
 * Repository: https://github.com/kolserdav/werift-sfu-react.git
 * File name: PseudoButton.tsx
 * Author: Sergey Kolmiller
 * Email: <uyem.ru@gmail.com>
 * License: MIT
 * License text: See in LICENSE file
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Wed Nov 23 2022 15:23:26 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/
import React, { useEffect, useState } from 'react';
import { PSEUDO_BUTTON_ANIMATION_TIMEOUT } from '../../utils/constants';
import { rangeRandom } from '../../utils/lib';
import s from './PseudoButton.module.scss';

function PseudoButton({ children, title }: { children: React.ReactNode; title: string }) {
  const [top, setTop] = useState<number>(0);
  const [left, setLeft] = useState<number>(0);

  return (
    <div className={s.wrapper} title={title}>
      {children}
    </div>
  );
}

export default PseudoButton;
