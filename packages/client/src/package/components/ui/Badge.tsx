import React from 'react';
import { Theme } from '../../Theme';
import s from './Badge.module.scss';

function Badge({
  children,
  value,
  theme,
  title,
}: {
  children: React.ReactNode;
  value: number | string;
  theme: Theme;
  title?: string;
}) {
  return (
    <div className={s.wrapper} title={title}>
      {children}
      <div
        className={s.value}
        style={{ backgroundColor: theme.colors.active, color: theme.colors.text }}
      >
        <div className={s.text}>{value}</div>
      </div>
    </div>
  );
}

Badge.defaultProps = {
  title: '',
};

export default Badge;
