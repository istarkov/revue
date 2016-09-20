import React from 'react';
import compose from 'recompose/compose';
import branch from 'recompose/branch';
import withPropsOnChange from 'recompose/withPropsOnChange';
import renderComponent from 'recompose/renderComponent';
import defaultProps from 'recompose/defaultProps';
import dimensions from '../HOCs/dimensions';

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
  scrollParams,
  rowHeight,
}) => (
  <div className={styles.main}>
    <pre
      style={size}
      className={styles.pre}
    >
      <FileHeaders
        headers={headers}
        scrollParams={scrollParams}
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
  dimensions('size', { width: 0, height: 0 }),
  branch(
    ({ size: { width, height } }) => width === 0 || height === 0,
    renderComponent(({ styles }) => <pre className={styles.main}></pre>),
    (x) => x
  ),
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
