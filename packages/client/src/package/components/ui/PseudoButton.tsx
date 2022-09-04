import React, { useEffect, useState } from 'react';
import { PSEUDO_BUTTON_ANIMATION_TIMEOUT } from '../../utils/constants';
import { rangeRandom } from '../../utils/lib';
import s from './PseudoButton.module.scss';

function PseudoButton({
  children,
  title,
  refActions,
  crownAnimation,
}: {
  children: React.ReactNode;
  title: string;
  refActions: React.MutableRefObject<HTMLDivElement>;
  crownAnimation?: boolean;
}) {
  const [top, setTop] = useState<number>(0);
  const [left, setLeft] = useState<number>(0);

  useEffect(() => {
    let interval = setInterval(() => {
      /**
       */
    }, 0);
    if (crownAnimation) {
      interval = setInterval(() => {
        const { current } = refActions;
        if (current) {
          const { clientLeft, clientHeight, clientTop, clientWidth } = current;
          const getXPosition = () =>
            rangeRandom({
              min: clientLeft,
              max: clientLeft + clientWidth,
            });
          const getYPosition = () =>
            rangeRandom({
              min: clientHeight + clientTop,
              max: clientLeft + clientWidth,
            });
          setLeft(getXPosition());
          setTop(getYPosition());
        }
      }, PSEUDO_BUTTON_ANIMATION_TIMEOUT);
    }
    return () => {
      clearInterval(interval);
    };
  }, [refActions, crownAnimation]);

  return (
    <div style={{ top: `${top}px`, left: `${left}px` }} className={s.wrapper} title={title}>
      {children}
    </div>
  );
}

PseudoButton.defaultProps = {
  crownAnimation: false,
};

export default PseudoButton;
