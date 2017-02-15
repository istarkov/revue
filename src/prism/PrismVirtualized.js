import React from 'react';
import compose from 'recompose/compose';
import withPropsOnChange from 'recompose/withPropsOnChange';
import defaultProps from 'recompose/defaultProps';
import withHandlers from 'recompose/withHandlers';
import PrismVirtualScroll from './PrismVirtualScroll';
import PrismLine from './PrismLine';
import FileHeaders from './FileHeaders';
import prismVirtualizedStyles from './prismVirtualized.sass';

export const prismVirtualized = ({
  styles,
  lines,
  size,
  scrollTop,
  onScroll,
  rowRenderer,
  headers,
  getScroll,
  rowHeight,
  registerFileHeader,
}) => (
  <div className={styles.main}>
    <pre
      style={size}
      className={styles.pre}
    >
      <FileHeaders
        ref={registerFileHeader}
        headers={headers}
        getScroll={getScroll}
        rowHeight={rowHeight}
      />
      <PrismVirtualScroll
        scrollTop={scrollTop}
        onScroll={onScroll}
        className={styles.virtualScroll}
        size={size}
        rowCount={lines.length}
        rowHeight={rowHeight}
        rowRenderer={rowRenderer}
      />
    </pre>
  </div>
);

export const prismVirtualizedHOC = compose(
  defaultProps({
    rowHeight: 20,
    styles: prismVirtualizedStyles,
    language: 'javascript',
    colorSchema: undefined, // use default
    onScroll: () => {},
    cache: new Map(),
  }),
  withHandlers(() => {
    let fileHeadersRef;

    return {
      onScroll: ({ onScroll }) => scroll => {
        onScroll(scroll);
        if (fileHeadersRef) {
          fileHeadersRef.forceUpdate();
        }
      },
      registerFileHeader: () => (ref) => {
        fileHeadersRef = ref;
      },
    };
  }),
  withPropsOnChange(
    ['lines', 'colorSchema', 'lineFrom', 'lineTo', 'cache'],
    ({ lines, colorSchema, lineFrom, lineTo, cache }) => ({
      // updating `rowRenderer` forces rerender of VirtualScroll
      rowRenderer: ({ index, style, key }) => (
        <PrismLine
          key={key}
          style={style}
          colorSchema={colorSchema}
          lineNumber={lines[index].lineNumber}
          tokens={lines[index].tokens}
          cache={cache}
          lineClass={
            // Math.max to avoid empty selection
            (lineFrom <= index && index <= Math.max(lineTo, lineFrom))
            ? 'opaque'
            : 'transparent'
          }
        />
      ),
    })
  ),
);

export default prismVirtualizedHOC(prismVirtualized);
