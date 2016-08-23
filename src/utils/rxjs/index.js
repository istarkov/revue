/* create a small subset of rxjs */
import { Observable } from 'rxjs/Observable';
import { from } from 'rxjs/observable/from';
import { merge } from 'rxjs/observable/merge';
import { of } from 'rxjs/observable/of';
import { ajax } from 'rxjs/observable/dom/ajax';
import { empty } from 'rxjs/observable/empty';
import { distinctUntilChanged } from 'rxjs/operator/distinctUntilChanged';
import { mergeMap } from 'rxjs/operator/mergeMap';
import { map } from 'rxjs/operator/map';
import { cache } from 'rxjs/operator/cache';
import { _catch } from 'rxjs/operator/catch';
import { combineLatest } from 'rxjs/operator/combineLatest';
import { startWith } from 'rxjs/operator/startWith';
import { delay } from 'rxjs/operator/delay';
import { skip } from 'rxjs/operator/skip';
import { take } from 'rxjs/operator/take';
import { retryWhen } from 'rxjs/operator/retryWhen';
import { concat } from 'rxjs/operator/concat';
import { scan } from 'rxjs/operator/scan';
import { combineAll } from 'rxjs/operator/combineAll';
import { _do } from 'rxjs/operator/do';
import { webWorkerMap } from './webWorkerMap';

class ObservableExt extends Observable {
  static from = (...args) => new ObservableExt(subs => from(...args).subscribe(subs));
  static of = (...args) => new ObservableExt(subs => of(...args).subscribe(subs));
  static merge = (...args) => new ObservableExt(subs => merge(...args).subscribe(subs));
  static empty = () => new ObservableExt(subs => empty().subscribe(subs));
  static ajax = (...args) => new ObservableExt(subs => ajax(...args).subscribe(subs));

  lift(operator) {
    const observable = new ObservableExt();
    observable.source = this;
    observable.operator = operator;
    return observable;
  }

  catch=_catch;
  cache=cache;
  combineAll=combineAll;
  combineLatest=combineLatest;
  concat=concat;
  delay=delay;
  distinctUntilChanged=distinctUntilChanged;
  do=_do;
  map=map;
  mergeMap=mergeMap;
  scan=scan;
  startWith=startWith;
  webWorkerMap=webWorkerMap;
  retryWhen = retryWhen;
  take=take;
  skip=skip;
}

export default ObservableExt;
