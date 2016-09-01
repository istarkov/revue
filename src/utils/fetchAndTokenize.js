// Emulate async fetch and async tokenize
// used for local development as sometimes I have no internet connection
import { Observable } from 'rxjs';
import tokenize from '../prism/utils/tokenize';
import detectLanguage from '../prism/utils/detectLanguage';
import { Base64 } from 'js-base64';

const NOT_PARSED_LINE_TOKENS = [{ type: 'notParsed', content: '' }];
const EMPTY_LINE_TOKENS = [{ type: 'emptyLine', content: '' }];

const EMPTY_LINE = {
  lineNumber: '',
  tokens: EMPTY_LINE_TOKENS,
};

const fileHeaderTokens = ({ path, href }, error) => [
  {
    lineNumber: '',
    tokens: [{
      type: 'fileHeader',
      error,
      href,
      content: path,
    }],
  },
];

const getUrl = ({ user, project, path, ref }) =>
  `/repos/${user}/${project}/contents/${path}?ref=${ref}`;

const fetchAndTokenize = (linkObj) => (
  Observable.ajax({
    method: 'GET',
    withCredentials: false,
    url: getUrl(linkObj),
  })
    .map(({ response }) => ({ content: Base64.decode(response.content) }))
    .catch(e => (Observable.of({
      error: true,
      content: `# ERROR LOADING
url: ${e.request.url}
status code: ${e.status}
message: ${e.message}
json: ${JSON.stringify(e.xhr.response, null, ' ')}
      `,
    })))
    .mergeMap(({ error, content }) =>
      Observable.of({
        link: linkObj,
        lines: [
          ...fileHeaderTokens(linkObj, error),
          // return empty token lines so we could start show files immediately after loading
          ...(content.split('\n').map((_, i) => ({
            lineNumber: `${i + 1}.`,
            tokens: NOT_PARSED_LINE_TOKENS,
          }))),
          EMPTY_LINE,
        ],
      })
      .concat(
          // TODO calculate tokens in webworker threads
          // no real reason for - just for fun
          // for now is just to be sure that all works fine
          Observable.of({
            link: linkObj,
            lines: [
              // append file name header
              ...fileHeaderTokens(linkObj, error),
              ...(
                tokenize(
                  content,
                  error === true
                    ? 'markdown' // TODO generate error coloring syntax
                    : detectLanguage({ path: linkObj.path, content })
                )
                  .map((tokens, i) => ({
                    lineNumber: `${i + 1}.`,
                    tokens,
                  }))
              ),
              EMPTY_LINE,
            ],
          })
        )
    )
);

export default fetchAndTokenize;
