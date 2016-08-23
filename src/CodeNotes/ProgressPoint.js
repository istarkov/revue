import React from 'react';
import compose from 'recompose/compose';
import defaultProps from 'recompose/defaultProps';
import withPropsOnChange from 'recompose/withPropsOnChange';
import withState from 'recompose/withState';
import withHandlers from 'recompose/withHandlers';

import progressPointStyles from './progressPoint.sass';
import { Motion, spring } from 'react-motion';

export const progressPoint = ({
  styles, motionStyle, onRest,
  onMouseEnter, onMouseLeave,
  onMouseDown, onClick, children,
}) => (
  <div
    className={styles.main}
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
    onMouseDown={onMouseDown}
    onClick={onClick}
  >
    <Motion
      style={motionStyle}
      onRest={onRest}
    >
      {
        ({ scale }) => (
          <div
            className={styles.point}
            style={{
              transform: `translate3D(0,0,0) scale(${scale}, ${scale})`,
            }}
          >
            {children}
          </div>
        )
      }
    </Motion>
  </div>
);

export const progressPointHOC = compose(
  defaultProps({
    styles: progressPointStyles,
    initialScale: 0.4,
    activeScale: 1,
    hoveredScale: 0.7,
    stiffness: 320,
    damping: 7,
    precision: 0.1,
    active: false,
  }),
  withState('hover', 'setHover', false),
  withHandlers({
    onMouseEnter: ({ setHover }) => () => {
      setHover(true);
    },
    onMouseLeave: ({ setHover }) => () => {
      setHover(false);
    },
    onClick: ({ onChange, value }) => () => {
      onChange(value);
    },
  }),
  withPropsOnChange(
    ['hover', 'active'],
    ({
      initialScale,
      hover, hoveredScale,
      active, activeScale,
      stiffness, damping, precision,
    }) => ({
      motionStyle: {
        scale: spring(
          active
            ? activeScale
            : hover
              ? hoveredScale
              : initialScale,
          { stiffness, damping, precision }
        ),
      },
    })
  )
);

export default progressPointHOC(progressPoint);
