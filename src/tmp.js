/* @flow */
import React from 'react';
import { compose, withProps, withState2 } from 'recompose';
import type { FunctionComponent, Component } from 'recompose';

type Props = {
  test: string,
};

type InputProps_ = {
  a: string,
  b: number,
  c?: string,
};

type InputProps = InputProps_ & $Shape<InputProps_>;

export const tmp: FunctionComponent<Props> = ({ test }) => (
  <div>
    {test}
  </div>
);

export const tmpHOC = compose(
  withState2({
    xx: () => 10,
  }),
  withState2({
    yy: ({ b, xx: { value } }) => (console.log(b), `${value}${b}`),
  }),
  withProps(({ a, b, xx: { value: xxValue, setValue }, yy: { value: yyValue } }) => ({
    test: `${a}`,
    b,
    xxValue,
    setXXValue: setValue,
    yyValue,
  })),
  withProps(({ test, b }) => ({
    test: `jo${test}${b}`,
  })),
);

export const Enhanced: Component<InputProps> = tmpHOC(tmp);

export const x = () => <Enhanced a={'1'} b={22} />;
