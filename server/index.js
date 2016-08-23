const express = require('express');
const proxy = require('http-proxy-middleware');
const chalk = require('chalk');
const path = require('path');
const compression = require('compression');

const app = express();

app.use(compression());
if (!process.env.GITHUB_USER_AUTH_TOKEN) {
  console.warn(chalk.red(`
    Please generate your token at ${chalk.underline.blue('https://github.com/settings/tokens')}
    and run
    ${chalk.yellow('GITHUB_USER_AUTH_TOKEN=\'username:token\' npm start')}
    otherwise you will get a really small github api rate limit (60 requests/hour)
  `));
}

if (!process.env.GOOGLE_API_KEY) {
  console.warn(chalk.red(`
    Please generate your google api key at ${chalk.underline.blue('https://console.developers.google.com')}
    and run with
    ${chalk.yellow('GOOGLE_API_KEY=\'username:token\' npm start')}
    otherwise save will not work
  `));
}

['/repos/*', '/rate_limit'].forEach(
  (v) => app.use(v, proxy({
    target: 'https://api.github.com',
    secure: false,
    changeOrigin: true,
    auth: process.env.GITHUB_USER_AUTH_TOKEN,
  }))
);

['/load/:shortUrl', '/save'].forEach(
  (v, index) => app.use(
    v,
    proxy({
      target: 'https://www.googleapis.com/urlshortener/v1/url',
      secure: false,
      changeOrigin: true,
      pathRewrite: (p) =>
        `?key=${process.env.GOOGLE_API_KEY}` +  // eslint-disable-line
          (
            index === 0
              ? p.replace(/^\/load\//, '&shortUrl=http%3A%2F%2Fgoo.gl%2F')
              : p.replace(/^\/save/, '')
          ),
    })
  )
);

app.use(express.static(path.join(__dirname, '/../build')));

app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, '../build', 'index.html'));
});

app.listen(3000);
