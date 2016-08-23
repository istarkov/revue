import React from 'react';
import compose from 'recompose/compose';
import defaultProps from 'recompose/defaultProps';
import loadingStyles from './loading.css';

export const loadingComponent = ({ styles, text }) => (
  <div className={styles.main}>
    <div className={styles.spinner}></div>
    <div className={styles.text}>{text}</div>
  </div>
);

export const loadingHOC = compose(
  defaultProps({
    styles: loadingStyles,
    text: 'LOADING DATA',
  })
);

export default loadingHOC(loadingComponent);
