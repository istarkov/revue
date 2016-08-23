import Observable from '../utils/rxjs';
import mapPropsStream from 'recompose/mapPropsStream';
import shallowEqual from 'fbjs/lib/shallowEqual';
import setObservableConfig from 'recompose/setObservableConfig';

setObservableConfig({
  fromESObservable: Observable.from,
});

const FILES_PROP = '6f02632e-1c8f-4009-b604-43c265f4f5c7'; // random guid

// generate requests based on `files` prop,
// cache results,
// update results iif all files loaded
// fetch: (file: string) => Observable<any>
export const fileLoader = (fetch, sourcePropGetter, mergePropsWithFetchResults) =>
  mapPropsStream((props$) => {
    const files$ = props$
      .map((props) => sourcePropGetter(props))
      .map(v => v || [])
      .distinctUntilChanged(shallowEqual)
      .scan(
        (r, files) => ({ // everytime files array updated
          ...r,
          [FILES_PROP]: files.map(file => JSON.stringify(file)),
          ...files
            .map(file => ({ fileKey: JSON.stringify(file), file }))
            .reduce( // prepare object of type { [file: string]: Observable }
              // TODO remove index
              (fr, { fileKey, file }, index) => ({
                ...fr,
                [fileKey]: r[fileKey] // reusing cached observables
                  ? r[fileKey]
                  : fetch(file, index)
                    .cache(1), // only last value is acceptable
              }),
              {}
            ),
        }),
        {}
      )
      .mergeMap(
        v => (
          v[FILES_PROP].length === 0
            ? Observable.of([])
            : Observable.from(v[FILES_PROP].map(k => v[k]))
              .combineAll( // wait all files uploaded
                (...args) => [...args] // otherwise looks like array is reused
              )
        )
      )
      .startWith(undefined); // remove if no need in Loading indicator

    return props$
      .distinctUntilChanged(shallowEqual)
      .combineLatest(
        files$,
        mergePropsWithFetchResults
      );
  });

export default fileLoader;
