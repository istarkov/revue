/*
instead of DB I use goo.gl url shortener, using short pathes as data keys,
and long urls as a data, such db is easy and free
*/
import { Observable } from 'rxjs';
import { Base64 } from 'js-base64';
const URL_LIKE_PREFIX = 'http://xxx';
import tmpCodeNote from './tmp/codeNotes';

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

const BIG_NUMBER = 1000000;
const RETRY_COUNT = 3;
const RETRY_DELAY = 1000;
const POST_URL = '/save';
const GET_URL = '/load';
const MAX_URL_LEN_GOOGL_ALLOWS = 2048;

export const saveAtUrlShortener = ({ text, maxLen = MAX_URL_LEN_GOOGL_ALLOWS }) => {
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
        url: POST_URL,
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
                throw new Error('Save error');
              })
          )
      )
    )
    .map(({ response }) => response)
    .map(({ id }) => id.replace('http://goo.gl/', ''))
    .bufferCount(BIG_NUMBER)
    .map(ids => ids.join('-'));
};

export const loadFromUrlShortener = (path) => (
  // for pathname like /test/0 I'll provide local data
  path === 'test'
    ? Observable.of(encodeText(tmpCodeNote, BIG_NUMBER)[0])
    : Observable
        .ajax({ type: 'GET', withCredentials: false, url: `${GET_URL}/${path}` })
        .retryWhen(error =>
          Observable
            .from(error)
            .delay(RETRY_DELAY)
            .take(RETRY_COUNT)
            .concat(
              Observable.of({})
                .map(() => {
                  throw new Error(`URL shortener loading error at path=${path}`);
                })
            )
        )
        .map(({ response }) => response)
        .map(({ longUrl }) => longUrl.substr(URL_LIKE_PREFIX.length + 2))
        .catch(e => Observable.of({ error: true, payload: e }))
);

export const decodeUrlShortenerData = (base64List) =>
  base64List.map(text => Base64.decode(text)).join('');
