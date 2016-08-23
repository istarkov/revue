import React from 'react';
import compose from 'recompose/compose';
import defaultProps from 'recompose/defaultProps';
import withHandlers from 'recompose/withHandlers';
import withPropsOnChange from 'recompose/withPropsOnChange';
import pure from 'recompose/pure';
import branch from 'recompose/branch';
import renderNothing from 'recompose/renderNothing';
import codeNotesStyles from './codeNotes.sass';
import ProgressPoint from './ProgressPoint';
import keyLogger from '../HOCs/keyLogger';
import PrismLine from '../prism/PrismLine';
import prismExStylesMd from './prismExStylesMd.sass';

export const codeNotes = ({
  styles,
  prismExStyles,
  noteLines,
  colorSchema,
  options,
  value,
  onChange,
}) => (
  <div className={styles.main}>
    <div className={styles.note}>
      {
        noteLines.map((tokens, index) => (
          <PrismLine
            key={index}
            prismExStyles={prismExStyles}
            colorSchema={colorSchema}
            showLineNumbers={false}
            tokens={tokens}
          />
        ))
      }
    </div>
    <div className={styles.progress}>
      {
        options.map((codeNote, index) => (
          <ProgressPoint
            key={index}
            active={value === codeNote.id}
            onChange={onChange}
            value={codeNote.id}
          />
        ))
      }
    </div>
  </div>
);

export const codeNotesHOC = compose(
  pure,
  defaultProps({
    styles: codeNotesStyles,
    colorSchema: undefined,
    prismExStyles: prismExStylesMd,
  }),
  branch(
    ({ options }) => options === undefined || options.length === 0,
    renderNothing,
    v => v
  ),
  withPropsOnChange(
    ['value', 'options'],
    ({ value, options }) => ({
      value: options.find(({ id }) => value === id) === undefined
        ? options[0].id
        : value,
    })
  ),
  withPropsOnChange(
    ['value', 'options'],
    ({ value, options }) => ({
      noteLines: options.find(({ id }) => value === id).noteLines,
    })
  ),
  withHandlers({
    setActiveFromDelta: ({ options, value, onChange }) => (delta) => {
      const activeIndex = value === undefined
        ? 0
        : ((idx) => Math.max(idx, 0))(options.findIndex(({ id }) => id === value));

      const newActiveIndex = Math.max(
        Math.min(activeIndex + delta, options.length - 1),
        0
      );
      onChange(options[newActiveIndex].id);
    },
  }),
  keyLogger(({ setActiveFromDelta }) => (e) => {
    const delta =
      ((e.keyCode === 37 || e.keyCode === 38) && -1) ||
      ((e.keyCode === 39 || e.keyCode === 40) && 1) ||
      ((e.keyCode === 32 && e.shiftKey === false) && 1) ||
      ((e.keyCode === 32 && e.shiftKey === true) && -1);

    if (delta !== false) {
      setActiveFromDelta(delta);
      e.preventDefault();
      e.stopPropagation();
    }
  }),
);

export default codeNotesHOC(codeNotes);
