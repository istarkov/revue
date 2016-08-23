import React from 'react';
import compose from 'recompose/compose';
import defaultProps from 'recompose/defaultProps';
import iconStyles from './icon.sass';
import { themr } from 'react-css-themr';

export const icon = ({ theme, name, size }) => (
  <svg className={`${theme.icon} ${theme[size]}`}>
    <use xlinkHref={`#${name}`} />
  </svg>
);

export const iconHOC = compose(
  themr('Icon', iconStyles),
  defaultProps({
    size: 'medium',
  })
);

export default iconHOC(icon);
