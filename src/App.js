import React, { Component } from 'react';
import Layout from './Layout';
import { Router, Route, browserHistory } from 'react-router';
import BadExample from './tmp/badExample';

export default class App extends Component { // eslint-disable-line
  render() {
    return (
      <Router history={browserHistory}>
        <Route path="/:noteKeys/:page" component={Layout} />
        <Route path="/" component={Layout} />
        <Route path="/bad" component={BadExample} />
      </Router>
    );
  }
}
