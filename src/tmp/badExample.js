import React from 'react';
import raf from 'raf';
import compose from 'recompose/compose';
import defaultProps from 'recompose/defaultProps';
import { VirtualScroll } from 'react-virtualized';
import withState from 'recompose/withState';
import withHandlers from 'recompose/withHandlers';
// import badExampleStyles from './badExample.scss';

const rowRenderer = ({ index }) => <div>ABCEFG: {index}</div>;
const style = {
  width: 400,
  height: 200,
  border: '1px solid red',
};

export const badExample = ({ scrollTop, runAnim }) => (
  console.log(scrollTop),
  <div style={style}>
    <VirtualScroll
      scrollTop={scrollTop}
      width={400} // 20 const that gt than scrollbar width
      height={200}
      rowCount={1000}
      rowHeight={20}
      rowRenderer={rowRenderer}
    />
    <button onClick={runAnim}>Click Me</button>
  </div>
);

export const badExampleHOC = compose(
  defaultProps({
  }),
  withState('scrollTop', 'setScrollTop', 0),
  withHandlers({
    runAnim: ({ setScrollTop }) => () => {
      let frame = 0;
      const anim = () => {
        setScrollTop(frame);
        frame++;
        if (frame < 100) {
          raf(anim);
        }
      };
      anim();
    },
  })
);

export default badExampleHOC(badExample);
