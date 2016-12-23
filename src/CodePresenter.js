import React from 'react';
import compose from 'recompose/compose';
import renderComponent from 'recompose/renderComponent';
import withPropsOnChange from 'recompose/withPropsOnChange';
import withProps from 'recompose/withProps';
import defaultProps from 'recompose/defaultProps';
import withState from 'recompose/withState';
import withHandlers from 'recompose/withHandlers';
import branch from 'recompose/branch';
import { TransitionMotion, spring } from 'react-motion';
import Loading from './Loading/Loading';
import PrismVirtualized from './prism/PrismVirtualized';
import CodeNotes from './CodeNotes';
import codePresenterStyles from './codePresenter.sass';

const EMPTY_ARRAY = [];

export const codePresenter = ({
  styles,
  lines, // combined lines of all files, see CodePresenterContainer for details
  headers, // headers pos and content, see CodePresenterContainer for details
  codeNotes, // to show Notes and Progress, see CodePresenterContainer for details
  scrollParams, // scroll params from virtual-scroll
  onScroll, // VirtualScroll onScroll callback
  lineFrom,
  lineTo,
  transitionKey,
  transitionStyles = EMPTY_ARRAY,
  transitionWillEnter,
  page,
  onPageChange,
  scrollTop,
}) => (
  <div className={styles.main}>
    <TransitionMotion
      styles={transitionStyles}
      willEnter={transitionWillEnter}
    >
      {
        (interpolatedStyles) => {
          const currentStyle = interpolatedStyles.find(s => s.key === transitionKey);

          const isInAnim = (currentStyle && currentStyle.style && currentStyle.style.scrollTop) !==
            scrollTop;

          return (
            <PrismVirtualized
              scrollTop={
                isInAnim && currentStyle && currentStyle.style
                  // Math.round until https://github.com/bvaughn/react-virtualized/issues/357
                  ? currentStyle.style.scrollTop
                  : scrollParams === undefined
                    ? 0
                    : scrollParams.scrollTop
              }
              lines={lines}
              headers={headers}
              onScroll={isInAnim ? undefined : onScroll}
              lineFrom={lineFrom}
              lineTo={lineTo}
            />
          );
        }
      }
    </TransitionMotion>

    <CodeNotes
      options={codeNotes}
      value={page}
      onChange={onPageChange}
    />
  </div>
);

export const codePresenterHOC = compose(
  defaultProps({
    styles: codePresenterStyles,
    rowHeight: 20,
    // TODO play with other params [250, 50, 0.005], [150, 30, 2], [200, 17, 0.05];
    scrollTopAnimParams: {
      stiffness: 150,
      damping: 25,
      // to hide pixel joggling at the end of animation juts stop animation earlier,
      precision: 15,
    },
  }),
  branch(
    ({ filesLinesTokens }) => filesLinesTokens === undefined,
    renderComponent(() => <Loading />),
    (v) => v,
  ),
  branch(
    ({ codeNotes }) => codeNotes === undefined || codeNotes.length === 0,
    renderComponent(() => <div style={{ margin: 'auto' }}>No Data</div>),
    (v) => v,
  ),
  // scroll support
  withState('scrollParams', 'setScrollParams', undefined),
  withHandlers({
    onScroll: ({ setScrollParams }) => (scroll) => {
      setScrollParams(scroll);
    },
  }),
  withProps(({ rowHeight, lines, scrollParams: { clientHeight } = {} }) => ({
    clientHeight,
    // scrollParams contains scrollHeight property but
    // onScroll does not called for example if lines length has changed
    // and as rowHeight is constant
    // it will be better to calculate scrollHeight here
    scrollHeight: lines.length * rowHeight,
  })),
  // calculate scrollTop offset, prepare styles for react-motion
  withPropsOnChange(
    ['page', 'clientHeight', 'scrollHeight', 'codeNotes', 'rowHeight', 'scrollTopAnimParams'],
    ({
      page,
      clientHeight,
      scrollHeight,
      codeNotes,
      rowHeight,
      scrollTopAnimParams: {
        stiffness,
        damping,
        precision,
      },
    }) => {
      if (clientHeight === undefined) return undefined;

      const HEADER_LINES_SIZE = 1;
      // I like to selection be started near top of the screen,
      // this const is just my visual preference
      const FINE_VISUAL_OFFSET_FOR_ME = 0.18;
      const currentActiveId = page || codeNotes[0].id;
      const note2Show = codeNotes.find(({ id }) => id === currentActiveId) || codeNotes[0];
      const { lineFrom, lineTo } = note2Show;
      const rowsToShow = lineTo - lineFrom + 1;
      const rowsOnScreen = Math.round(clientHeight / rowHeight) - HEADER_LINES_SIZE;
      const rowsThatsFine = rowsOnScreen * (1 - 2 * FINE_VISUAL_OFFSET_FOR_ME);

      const rowOffset = Math.max(
        0,
        Math.round(rowsOnScreen * FINE_VISUAL_OFFSET_FOR_ME) -
          Math.max(0, Math.ceil((rowsToShow - rowsThatsFine) / 2))
      );

      const scrollTop = Math.min(
        Math.max(0, (lineFrom - HEADER_LINES_SIZE - rowOffset) * rowHeight),
        scrollHeight - clientHeight
      );

      const transitionKey = `${lineFrom}-${lineTo}`;

      const transitionStyles = [{
        key: transitionKey,
        style: {
          scrollTop: spring(
            scrollTop,
            { stiffness, damping, precision }
          ),
        },
      }];

      return {
        transitionKey,
        transitionStyles,
        scrollTop,
        lineFrom,
        lineTo,
      };
    }
  ),
  withHandlers({
    transitionWillEnter: ({ scrollParams }) => () => ({
      scrollTop: scrollParams.scrollTop,
    }),
  })
);

export default codePresenterHOC(codePresenter);
