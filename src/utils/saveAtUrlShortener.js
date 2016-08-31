import { Observable } from 'rxjs';
import { Base64 } from 'js-base64';
const URL_LIKE_PREFIX = 'http://xxx';

const encodeText = (text, maxLen) => {
  const encoded = Base64.encode(text);
  if (encoded.length > maxLen) {
    const splitPoint = encoded.length >> 1;
    return [
      ...encodeText(text.slice(0, splitPoint), maxLen),
      ...encodeText(text.slice(splitPoint), maxLen),
    ];
  }
  return [encoded];
};

const RETRY_COUNT = 3;
const RETRY_DELAY = 1000;
const END_OBJ = {};

export default ({ text, maxLen, url }) => {
  const encodedTexts = encodeText(text, maxLen);

  return Observable
    .from(encodedTexts)
    .map(part => ({
      longUrl: `${URL_LIKE_PREFIX}?${part}`,
    }))
    // save sequentially
    .concatMap(body =>
      Observable.ajax({
        method: 'POST',
        url,
        body,
        withCredentials: false,
        crossDomain: false,
        headers: {
          'Content-Type': 'application/json',
        },
      })
      .retryWhen(error =>
        Observable.from(error)
          .delay(RETRY_DELAY)
          .take(RETRY_COUNT)
          .concat(
            Observable.of({})
              .map(() => {
                throw new Error('Retry Error');
              })
          )
      )
    )
    .map(({ response }) => response)
    .map(({ id }) => id.replace('http://goo.gl/', ''))
    .concat(Observable.of(END_OBJ))
    .scan((r, v) => (
        v === END_OBJ
          ? { ...r, isEnd: true }
          : { keys: r.keys === '' ? v : `${r.keys}-${v}` }
      ),
      { keys: '' }
    )
    .mergeMap(v => (
      v.isEnd
        ? Observable.of(v.keys)
        : Observable.empty()
    ));
};
