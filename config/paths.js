import path from 'path';

const BACKEND_URL = 'https://api.github.com'; // 'https://localhost';

export default {
  appBuild: path.join(__dirname, '../build'),
  appHtml: path.join(__dirname, './template/index.html'),
  appFavicon: path.join(__dirname, './template/favicon.png'),
  appSrc: path.join(__dirname, '../src'),
  appProxy: BACKEND_URL,
  appNodeModules: path.join(__dirname, '../node_modules'),
};
