import React from 'react';
import cx from 'classnames';
import compose from 'recompose/compose';
import withProps from 'recompose/withProps';
// import withPropsOnChange from 'recompose/withPropsOnChange';
import pure from 'recompose/pure';
import defaultProps from 'recompose/defaultProps';

import prismLineStylesOkaida from 'prismjs/themes/prism-okaidia.css';
import prismLineStylesTomorrow from 'prismjs/themes/prism-tomorrow.css';
import prismLineStylesCoy from 'prismjs/themes/prism-coy.css';
import prismLineStylesDark from 'prismjs/themes/prism-dark.css';
import prismLineStylesFunky from 'prismjs/themes/prism-funky.css';
import prismLineStylesTwilight from 'prismjs/themes/prism-twilight.css';
import prismLineStylesBase from 'prismjs/themes/prism.css';

import prismLineStyles from './prismLine.sass';

const prismColorStyles = {
  okaidia: prismLineStylesOkaida,
  tomorrow: prismLineStylesTomorrow,
  coy: prismLineStylesCoy,
  dark: prismLineStylesDark,
  funky: prismLineStylesFunky,
  twilight: prismLineStylesTwilight,
  base: prismLineStylesBase,
};

function type2Classes(styles, type) {
  if (Array.isArray(type)) {
    return type.map(t => styles[t] || `not_found_${t}`).join(' ');
  }

  return styles[type] || `not_found_${type}`;
}

function hasType(types, type) {
  if (types === type) {
    return types;
  }

  if (types.indexOf(type) > -1) {
    return types;
  }

  return NaN; // false on compare, as types can be undefined
}

const renderTokens = (tokens, prismLineStylesDefault, styles) =>
  tokens.map(({ type, content, href, error }, index) => {
    switch (type) {
      case hasType(type, 'fileHeader'): {
        return (
          <div
            key={index}
            className={cx({
              [styles.fileHeader]: true,
              [styles.fileHeaderError]: error,
            })}
          >
            <a
              href={href}
              target="_blank"
              className={styles.fileHeaderLink}
            >
              {content}
            </a>
          </div>
        );
      }

      case hasType(type, 'url'): {
        return (
          <a
            href={href}
            target="_blank"
            key={index}
            className={
              `${prismLineStylesDefault.token} ${type2Classes(prismLineStylesDefault, type)}`
            }
          >
            {content}
          </a>
        );
      }

      default: {
        return (
          <span
            key={index}
            className={
              `${prismLineStylesDefault.token} ${type2Classes(prismLineStylesDefault, type)}`
            }
          >
            {content}
          </span>
        );
      }
    }
  });

const renderCachedTokens = (cache, tokens, prismLineStylesDefault, styles) => {
  if (!cache.has(tokens)) {
    cache.set(tokens, renderTokens(tokens, prismLineStylesDefault, styles));
  }

  return cache.get(tokens);
};

export const prismLine = ({
  lineClass,
  styles,
  prismLineStylesDefault,
  tokens,
  lineNumber,
  isHeader,
  showLineNumbers,
  cache,
}) => (
  <div className={isHeader ? styles.header : styles[lineClass]}>
    {
      showLineNumbers &&
        <span data-line-number={lineNumber} />
    }
    {
      cache
        ? renderCachedTokens(cache, tokens, prismLineStylesDefault, styles)
        : renderTokens(tokens, prismLineStylesDefault, styles)
    }
  </div>
);

export const prismLineHOC = compose(
  pure, // prevent line rendering if nothing has changed
  defaultProps({
    colorSchema: 'okaidia',
    lineClass: 'opaque',
    lineNumber: '',
    tokens: [],
    showLineNumbers: true,
    styles: prismLineStyles,
  }),
  withProps(({ tokens, prismExStyles, colorSchema }) => ({
    isHeader: tokens.length && tokens[0].type === 'fileHeader',
    prismLineStylesDefault: prismExStyles === undefined
      ? prismColorStyles[colorSchema]
      : {
        ...prismColorStyles[colorSchema],
        ...prismExStyles,
      },
  }))
);

export default prismLineHOC(prismLine);
