import React, { useMemo } from 'react';
import { Theme } from '../../Theme';
import s from './Input.module.scss';

function Input(
  props: React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> & {
    // eslint-disable-next-line react/require-default-props
    theme?: Theme;
  }
) {
  const { theme } = props;
  const _props = useMemo(() => {
    const propsCopy = { ...props };
    delete propsCopy.theme;
    return propsCopy;
  }, [props]);

  return (
    <input
      className={s.wrapper}
      {..._props}
      style={{ backgroundColor: theme?.colors.text, color: theme?.colors.paper }}
    />
  );
}

export default Input;
