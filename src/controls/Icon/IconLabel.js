import React from 'react';
import compose from 'recompose/compose';
import defaultProps from 'recompose/defaultProps';
import { themr } from 'react-css-themr';
import Icon from './Icon';
import iconLabelStyles from './iconLabel.sass';

export const iconLabel = ({ name, theme, onClick }) => (
  <div onClick={onClick} className={theme.iconLabel}>
    <Icon name={name} theme={theme} />
  </div>
);

export const iconLabelHOC = compose(
  themr('IconLabel', iconLabelStyles),
  defaultProps({
    onClick: () => {},
  }),
);

export default iconLabelHOC(iconLabel);
