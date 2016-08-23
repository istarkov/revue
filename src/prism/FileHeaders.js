import React from 'react';
import cx from 'classnames';
import compose from 'recompose/compose';
import defaultProps from 'recompose/defaultProps';
import withPropsOnChange from 'recompose/withPropsOnChange';
import pure from 'recompose/pure';
import mapProps from 'recompose/mapProps';
import fileHeadersStyles from './fileHeaders.sass';
import scrollbarSize from 'dom-helpers/util/scrollbarSize';

export const fileHeaders = ({ posStyle, styles, currentHeader }) => (
  <div
    className={cx({
      [styles.fileHeader]: true,
      [styles.fileHeaderError]: currentHeader.error,
    })}
    style={posStyle}
  >
    <a
      href={currentHeader.href}
      target="_blank"
      className={styles.fileHeaderLink}
    >
      {currentHeader.content}
    </a>
  </div>
);

export const fileHeadersHOC = compose(
  defaultProps({
    styles: fileHeadersStyles,
    scrollParams: { scrollTop: 0 },
  }),
  withPropsOnChange(
    ['rowHeight', 'scrollParams', 'headers'],
    ({ rowHeight, scrollParams: { scrollTop }, headers }) => {
      const headersReversed = [...headers].reverse();
      const currentHeaderIdx = headersReversed
        .findIndex(({ lineNumber }) => (lineNumber * rowHeight <= scrollTop));

      const offset = currentHeaderIdx > 0
        ? Math.min(
            headersReversed[currentHeaderIdx - 1].lineNumber * rowHeight - scrollTop - rowHeight,
            0
          )
        : 0;

      return {
        offset,
        currentHeader: headersReversed[currentHeaderIdx] || {
          href: '',
          content: '',
        },
      };
    }
  ),
  withPropsOnChange(
    ['offset'],
    ({ offset, rowHeight }) => ({
      posStyle: {
        top: offset,
        height: rowHeight,
        paddingRight: scrollbarSize(), // memoized in lib
      },
    })
  ),
  // omit scrollParams
  mapProps(({ scrollParams, ...props }) => props), // eslint-disable-line
  pure
);

export default fileHeadersHOC(fileHeaders);
