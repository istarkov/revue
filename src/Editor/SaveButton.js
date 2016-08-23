import React from 'react';
import compose from 'recompose/compose';
import defaultProps from 'recompose/defaultProps';
import withPropsOnChange from 'recompose/withPropsOnChange';
import saveButtonStyles from './saveButton.sass';
import withState from 'recompose/withState';
import withHandlers from 'recompose/withHandlers';
import { Motion, spring } from 'react-motion';
import Observable from '../utils/rxjs';
import mapPropsStream from 'recompose/mapPropsStream';
// import shallowEqual from 'fbjs/lib/shallowEqual';
import setObservableConfig from 'recompose/setObservableConfig';

setObservableConfig({
  fromESObservable: Observable.from,
});


export const saveButton = ({
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

export const saveButtonHOC = compose(
  defaultProps({
    styles: saveButtonStyles,
    initialScale: 0.6,
    activeScale: 0.9,
    hoveredScale: 1.0,
    clickScale: 0.9,
    stiffness: 250,
    damping: 7,
    precision: 0.01,
    active: false,
  }),
  withPropsOnChange(
    ['active'],
    ({ active, styles }) => ({
      styles: {
        ...styles,
        main: active
          ? `${styles.main} ${styles.visible}`
          : `${styles.main}`,
      },
    })
  ),
  withState('hover', 'setHover', false),
  withState('mouseDown', 'setMouseDown', false),
  withHandlers({
    onMouseEnter: ({ setHover }) => () => {
      setHover(true);
    },
    onMouseLeave: ({ setHover }) => () => {
      setHover(false);
    },
    onMouseDown: ({ setMouseDown }) => () => {
      setMouseDown(true);
    },
    onClick: ({ setMouseDown, onClick }) => () => {
      setMouseDown(false);
      if (onClick) {
        onClick();
      }
    },
  }),
  // Depending on last action hover or click I set animation settings
  mapPropsStream((props$) => {
    const motionSettings$ = Observable.merge(
      props$
        .distinctUntilChanged(({ hover: prev }, { hover }) => hover === prev)
        .skip(1)
        .map(({ stiffness, damping, precision }) => ({ stiffness, damping, precision })),
      props$
        .distinctUntilChanged(({ mouseDown: prev }, { mouseDown }) => mouseDown === prev)
        .skip(1)
        .map(({ stiffness, damping, precision }) => ({
          stiffness: stiffness * 4,
          damping: damping * 2,
          precision,
        })),
    )
    .startWith({});

    return props$
      .combineLatest(
        motionSettings$,
        (props, sett) => ({
          ...props,
          ...sett,
        })
      );
  }),
  withPropsOnChange(
    ['hover', 'active', 'mouseDown'],
    ({
      initialScale,
      hover, mouseDown, hoveredScale,
      active, activeScale, clickScale,
      stiffness, damping, precision,
    }) => ({
      motionStyle: {
        scale: spring(
          active
            ? hover
              ? mouseDown
                ? clickScale
                : hoveredScale
              : activeScale
            : initialScale,
          { stiffness, damping, precision }
        ),
      },
    })
  )
);

export default saveButtonHOC(saveButton);
