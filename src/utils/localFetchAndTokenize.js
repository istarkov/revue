// Emulate async fetch and async tokenize
// used for local development as sometimes I have no internet connection
import { Observable } from 'rxjs';

import tokenize from '../prism/utils/tokenize';
import detectLanguage from '../prism/utils/detectLanguage';
import code from './tmp/code';

const NOT_PARSED_LINE_TOKENS = [{ type: 'notParsed', content: '' }];
const EMPTY_LINE_TOKENS = [{ type: 'emptyLine', content: '' }];

const EMPTY_LINE = {
  lineNumber: '',
  tokens: EMPTY_LINE_TOKENS,
};

const fileHeaderTokens = (path) => [
  {
    lineNumber: '',
    tokens: [{ type: 'fileHeader', href: path, content: path }],
  },
];

const DELAY = 50;

const localFetchAndTokenize = (linkObj, index) => (
  Observable.of(code[linkObj.path])
    .delay(DELAY) // emulate delay
    .mergeMap(content =>
      Observable.of({
        link: linkObj,
        lines: [
          ...fileHeaderTokens(linkObj.path),
          // return empty token lines so we could start show files immediately after loading
          ...(content.split('\n').map((_, i) => ({
            lineNumber: `${i + 1}.`,
            tokens: NOT_PARSED_LINE_TOKENS,
          }))),
          EMPTY_LINE,
        ],
      }).concat(
          // TODO calculate tokens in webworker threads
          // no real reason for - just for fun
          // for now is just to be sure that all works fine
          Observable.of({
            link: linkObj,
            lines: [
              // append file name header
              ...fileHeaderTokens(linkObj.path),
              ...(
                tokenize(content, detectLanguage({ path: linkObj.path, content }))
                  .map((tokens, i) => ({
                    lineNumber: `${i + 1}.`,
                    tokens,
                  }))
              ),
              EMPTY_LINE,
            ],
          })
            .delay((1 + index) * DELAY)  // emulate delay
        )
    )
);

export default localFetchAndTokenize;
