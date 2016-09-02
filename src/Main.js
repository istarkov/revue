import './prism/utils/languages';
import { AppContainer } from 'react-hot-loader';
import React from 'react';
import App from './App';
import { render } from 'react-dom';
import 'normalize.css/normalize.css';
import 'react-virtualized/styles.css';
import './Main.sass';

const mountNode = document.getElementById('app');

import webfontloader from 'webfontloader';

webfontloader.load({
  google: {
    families: ['Roboto Mono'],
  },
});

render(
  <AppContainer>
    <App />
  </AppContainer>,
  mountNode
);

if (module.hot) {
  module.hot.accept('./App', () => {
    const NextApp = require('./App').default; // eslint-disable-line
    render(
      <AppContainer>
        <NextApp />
      </AppContainer>,
      mountNode
    );
  });
}
