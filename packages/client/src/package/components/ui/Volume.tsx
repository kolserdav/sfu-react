import React from 'react';
import s from './Volume.module.scss';

function Volume(
  props: Omit<
    React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>,
    'className' | 'type' | 'min' | 'max'
  >
) {
  return <input {...props} className={s.wrapper} type="range" min="0" max="100" />;
}

export default Volume;
