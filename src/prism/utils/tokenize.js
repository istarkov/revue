/* @flow */
import { tokenize, languages } from 'prismjs';
import './components/prismMarkdown';
import 'prismjs/components/prism-php';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-sass';
import 'prismjs/components/prism-scss';
import 'prismjs/components/prism-bash';
import type { Token } from 'prismjs'; // eslint-disable-line

const guid = 'c92b0471-8718-4b38-9ffe-d169f6e33910';
const guidNgiud = `${guid}\n${guid}`;

export type LineToken = {
  type: string | string[],
  content: string,
  href?: string,
}
export type TokensLine = Array<LineToken>;

// not sure I need this function
function encodeString(str: string) {
  return str
    .replace(/\n/g, guidNgiud)
    .split(guid)
    .filter(v => v !== '');
}

function combineTypes(parentTypes: string[], type: string) {
  if (parentTypes.length === 0) {
    return type;
  }
  return [...parentTypes, type];
}

function encode(token: Token | Array<Token> | string, parentTypes: string[], encodedTokens) {
  if (typeof token === 'object') {
    if (Array.isArray(token)) {
      token.forEach(t => encode(t, parentTypes, encodedTokens));
      return;
    }

    if (typeof token.content === 'string') {
      const tokens = encodeString(token.content)
        .map(content => ({
          // $FlowFixMe
          type: content === '\n' ? '\n' : combineTypes(parentTypes, token.type),
          content,
        }));

      tokens.forEach(t => encodedTokens.push(t));
      return;
    }

    encode(token.content, [...parentTypes, token.type], encodedTokens);
    return;
  }

  const tokens = encodeString(token)
    .map(content => ({
      type: content === '\n' ? '\n' : combineTypes(parentTypes, 'text'),
      content,
    }));
  tokens.forEach(t => encodedTokens.push(t));
}

/**
 * For each code line return line of tokens
 */
function getLineTokens(
  code: string, language: string, removePunctuation: boolean = false
): Array<TokensLine> {
  const tokens = tokenize(code, languages[language]);

  const encodedTokens = [];
  tokens.forEach(token => encode(token, [], encodedTokens));

  const res = encodedTokens
    // .concat(...tokens.map(encode))
    .reduce(
      (r, v) => {
        if (v.type === '\n') {
          r.push([]);
        } else {
          if (removePunctuation) {
            if (v.type.indexOf('punctuation') === -1) {
              r[r.length - 1].push(v);
            }
          } else {
            r[r.length - 1].push(v);
          }
        }
        return r;
      },
      [[]]
    );
  return res;
}

export default getLineTokens;
