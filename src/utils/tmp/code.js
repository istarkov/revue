const codeJs1 = `import React, { Component } from 'react';
import compose from 'recompose/compose';
import withState from 'recompose/withState';
import defaultProps from 'recompose/defaultProps';
import layoutStyles from './Layout.sass';
import Tmp from './Tmp';

// for hmr to work I need the first class to extend Component
export class Layout extends Component { // eslint-disable-line
  render() {
    const {
      styles: {
        layout,
        main,
        side,
      },
      scrollTop,
      // setScrollTop,
      files,
    } = this.props;
    return (
      <div className={layout}>
        <div className={side} />
        <main className={main}>
          <Tmp scrollTop={scrollTop} files={files} />
        </main>
        <div className={side}>
          {/* add corner http://tholman.com/github-corners/ */}
          {/* <button onClick={() => setScrollTop(300)}>OK</button> */}
        </div>
      </div>
    );
  }

  render() {
    const {
      styles: {
        layout,
        main,
        side,
      },
      scrollTop,
      // setScrollTop,
      files,
    } = this.props;
    return (
      <div className={layout}>
        <div className={side} />
        <main className={main}>
          <Tmp scrollTop={scrollTop} files={files} />
        </main>
        <div className={side}>
          {/* add corner http://tholman.com/github-corners/ */}
          {/* <button onClick={() => setScrollTop(300)}>OK</button> */}
        </div>
      </div>
    );
  }
}

// for hmr to work I need the first class to extend Component
export class Layout extends Component { // eslint-disable-line
  render() {
    const {
      styles: {
        layout,
        main,
        side,
      },
      scrollTop,
      // setScrollTop,
      files,
    } = this.props;
    return (
      <div className={layout}>
        <div className={side} />
        <main className={main}>
          <Tmp scrollTop={scrollTop} files={files} />
        </main>
        <div className={side}>
          {/* add corner http://tholman.com/github-corners/ */}
          {/* <button onClick={() => setScrollTop(300)}>OK</button> */}
        </div>
      </div>
    );
  }

  render() {
    const {
      styles: {
        layout,
        main,
        side,
      },
      scrollTop,
      // setScrollTop,
      files,
    } = this.props;
    return (
      <div className={layout}>
        <div className={side} />
        <main className={main}>
          <Tmp scrollTop={scrollTop} files={files} />
        </main>
        <div className={side}>
          {/* add corner http://tholman.com/github-corners/ */}
          {/* <button onClick={() => setScrollTop(300)}>OK</button> */}
        </div>
      </div>
    );
  }
}

// for hmr to work I need the first class to extend Component
export class Layout extends Component { // eslint-disable-line
  render() {
    const {
      styles: {
        layout,
        main,
        side,
      },
      scrollTop,
      // setScrollTop,
      files,
    } = this.props;
    return (
      <div className={layout}>
        <div className={side} />
        <main className={main}>
          <Tmp scrollTop={scrollTop} files={files} />
        </main>
        <div className={side}>
          {/* add corner http://tholman.com/github-corners/ */}
          {/* <button onClick={() => setScrollTop(300)}>OK</button> */}
        </div>
      </div>
    );
  }

  render() {
    const {
      styles: {
        layout,
        main,
        side,
      },
      scrollTop,
      // setScrollTop,
      files,
    } = this.props;
    return (
      <div className={layout}>
        <div className={side} />
        <main className={main}>
          <Tmp scrollTop={scrollTop} files={files} />
        </main>
        <div className={side}>
          {/* add corner http://tholman.com/github-corners/ */}
          {/* <button onClick={() => setScrollTop(300)}>OK</button> */}
        </div>
      </div>
    );
  }
}

// for hmr to work I need the first class to extend Component
export class Layout extends Component { // eslint-disable-line
  render() {
    const {
      styles: {
        layout,
        main,
        side,
      },
      scrollTop,
      // setScrollTop,
      files,
    } = this.props;
    return (
      <div className={layout}>
        <div className={side} />
        <main className={main}>
          <Tmp scrollTop={scrollTop} files={files} />
        </main>
        <div className={side}>
          {/* add corner http://tholman.com/github-corners/ */}
          {/* <button onClick={() => setScrollTop(300)}>OK</button> */}
        </div>
      </div>
    );
  }

  render() {
    const {
      styles: {
        layout,
        main,
        side,
      },
      scrollTop,
      // setScrollTop,
      files,
    } = this.props;
    return (
      <div className={layout}>
        <div className={side} />
        <main className={main}>
          <Tmp scrollTop={scrollTop} files={files} />
        </main>
        <div className={side}>
          {/* add corner http://tholman.com/github-corners/ */}
          {/* <button onClick={() => setScrollTop(300)}>OK</button> */}
        </div>
      </div>
    );
  }
}

// for hmr to work I need the first class to extend Component
export class Layout extends Component { // eslint-disable-line
  render() {
    const {
      styles: {
        layout,
        main,
        side,
      },
      scrollTop,
      // setScrollTop,
      files,
    } = this.props;
    return (
      <div className={layout}>
        <div className={side} />
        <main className={main}>
          <Tmp scrollTop={scrollTop} files={files} />
        </main>
        <div className={side}>
          {/* add corner http://tholman.com/github-corners/ */}
          {/* <button onClick={() => setScrollTop(300)}>OK</button> */}
        </div>
      </div>
    );
  }

  render() {
    const {
      styles: {
        layout,
        main,
        side,
      },
      scrollTop,
      // setScrollTop,
      files,
    } = this.props;
    return (
      <div className={layout}>
        <div className={side} />
        <main className={main}>
          <Tmp scrollTop={scrollTop} files={files} />
        </main>
        <div className={side}>
          {/* add corner http://tholman.com/github-corners/ */}
          {/* <button onClick={() => setScrollTop(300)}>OK</button> */}
        </div>
      </div>
    );
  }
}
`;

const codeJs0 = `// copypasted from rackt/reselect
/*
coment
*/
const defaultEqualityCheck = (a, b) => a === b;
// --------------------------------------------------------
export default (func, equalityCheck = defaultEqualityCheck) => {
  let lastArgs = null;
  let lastResult = null;
  return (...args) => {
    if (
      lastArgs !== null &&
      lastArgs.length === args.length &&
      args.every((value, index) => equalityCheck(value, lastArgs[index]))
    ) {
      return lastResult;
    }
    lastArgs = args;
    lastResult = func(...args);
    return lastResult;
  };
};
//--------------------`;


const codeSass0 = `.layout
  display: flex
  height: 100vh

.side
  flex: 19
.main
  flex: 62
  display: flex
  width: 60%

@media only screen and (max-width: 900px)
  .side
    flex: 0

@media only screen and (max-device-width: 900px)
  .side
    flex: 0
`;

export default {
  'src/oneBigCool.js': codeJs0,
  'src/sass/myStyle.sass': codeSass0,
  'src/Third.js': codeJs1,
};
