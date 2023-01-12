import React, { useMemo } from 'react';
import { Theme } from '../../Theme';
import s from './Button.module.scss';

function Button(
  props: Omit<
    React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>,
    'type'
    // eslint-disable-next-line react/require-default-props
  > & { theme?: Theme }
) {
  const { theme } = props;
  const _props = useMemo(() => {
    const propsCopy = { ...props };
    delete propsCopy.theme;
    return propsCopy;
  }, [props]);

  return (
    <button
      style={{
        backgroundColor: theme?.colors.text,
        color: theme?.colors.paper,
      }}
      className={s.wrapper}
      type="button"
      {..._props}
    />
  );
}

export default Button;
