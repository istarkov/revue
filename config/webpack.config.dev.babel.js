// New webpack config for cnr-frontend
// TODO production config https://github.com/facebookincubator/create-react-app/blob/master/config/webpack.config.prod.js
import path from 'path';
import autoprefixer from 'autoprefixer';
import webpack from 'webpack';
import babelConfig from './babel.dev';
import paths from './paths';
import CaseSensitivePathsPlugin from 'case-sensitive-paths-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import chalk from 'chalk';

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

// remove all of this when we move project onto babel 6
export default {
  devtool: 'cheap-source-map',
  entry: [
    `${require.resolve('webpack-dev-server/client')}?/`,
    require.resolve('webpack/hot/dev-server'),
    require.resolve('react-hot-loader/patch'),
    // path.join(paths.appSrc, 'polyfills'),
    path.join(paths.appSrc, 'Main'),
  ],
  output: {
    // Next line is not used in dev but WebpackDevServer crashes without it:
    path: paths.appBuild,
    pathinfo: true,
    filename: 'static/js/bundle.js',
    publicPath: '/',
  },
  devServer: {
    progress: true,
    colors: true,
    host: '0.0.0.0',
    port: (process.env.PORT || 3000),
    inline: true,
    hot: true,
    historyApiFallback: true,
    proxy: {
      // github api proxy
      ...(
        ['/repos/*', '/rate_limit'].reduce(
          (r, v) => ({
            ...r,
            [v]: {
              target: paths.appProxy,
              secure: false,
              changeOrigin: true,
              auth: process.env.GITHUB_USER_AUTH_TOKEN,
            },
          }),
          {}
        )
      ),
      // google url shortener proxy
      ...(
        ['/load/*', '/save'].reduce(
          (r, v, index) => ({
            ...r,
            [v]: {
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
            },
          }),
          {}
        )
      ),
    },
  },
  resolve: {
    alias: {
      // 'react-components-markdown': path.join(__dirname, '../src'),
    },
    modulesDirectories: [
      paths.appSrc,
      'node_modules',
    ],
    extensions: ['', '.web.js', '.js', '.jsx'], // eslint-disable-line
  },
  resolveLoader: {
    root: paths.appNodeModules,
  },
  postcss: [
    autoprefixer({ browsers: ['last 2 versions'] }),
  ],
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
    new HtmlWebpackPlugin({
      inject: true,
      template: paths.appHtml,
      favicon: paths.appFavicon,
    }),
    // new webpack.optimize.CommonsChunkPlugin('vendor', 'vendor.bundle.js'),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV || 'development'),
      },
    }),
    new CaseSensitivePathsPlugin(),
  ],
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        loader: require.resolve('babel-loader'),
        query: babelConfig,
        include: [
          paths.appSrc,
        ],
      },
      {
        test: /\.sass$/,
        loaders: [
          'style-loader',
          'css-loader?modules&importLoaders=2&localIdentName=[name]__[local]', // [hash:5]
          'postcss-loader',
          'sass-loader?precision=10&indentedSyntax=sass',
        ],
        include: [
          paths.appSrc,
        ],
      },
      {
        test: /\.css$/,
        loaders: [
          'style-loader',
          'css-loader?modules&importLoaders=1&localIdentName=[name]__[local]', // [hash:5]
          'postcss-loader',
        ],
        include: [
          paths.appSrc,
          paths.appNodeModules,
        ],
        exclude: [
          path.join(paths.appNodeModules, 'codemirror'),
          path.join(paths.appNodeModules, 'react-virtualized'),
        ],
      },
      {
        test: /\.css$/,
        loaders: [
          'style-loader',
          'css-loader', // [hash:5]
          'postcss-loader',
        ],
        include: [
          path.join(paths.appNodeModules, 'codemirror'),
          path.join(paths.appNodeModules, 'react-virtualized'),
        ],
      },
      {
        test: /\.svg$/,
        loaders: ['url-loader?limit=7000'],
      },
    ],
  },
};
