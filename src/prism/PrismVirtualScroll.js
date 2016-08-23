import React from 'react';
import pure from 'recompose/pure';
import { VirtualScroll } from 'react-virtualized';

const SCROLL_BAR_MAX_WIDTH = 20;

// the only idea of this control is to avoid any additional rerender
// on VirtualScroll
export const prismVirtualScroll = ({
  scrollTop, onScroll, className, size, rowCount, rowHeight, rowRenderer,
}) => (
  <VirtualScroll
    // overscanRowCount={1000}
    scrollTop={scrollTop}
    onScroll={onScroll}
    className={className}
    width={size.width + SCROLL_BAR_MAX_WIDTH} // 20 const that gt than scrollbar width
    height={size.height}
    rowCount={rowCount}
    rowHeight={rowHeight}
    rowRenderer={rowRenderer}
  />
);

export default pure(prismVirtualScroll);
