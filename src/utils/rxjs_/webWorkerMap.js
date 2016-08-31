import { Observable } from 'rxjs/Observable';

const createWorker = (fn) => {
  const blob = new Blob(
    [
      `
      var callback = ${fn};
      self.onmessage = function (e) {
        self.postMessage(callback(e.data));
      };
      `,
    ],
    { type: 'application/javascript' }
  );

  const url = URL.createObjectURL(blob);
  return [new Worker(url), url];
};

export function webWorkerMap(callback) {
  return Observable.create(subscriber => {
    const source = this;
    const [worker, url] = createWorker(callback);
    let terminate = false;
    let refCount = 0;

    const completeIfDone = () => {
      if (terminate === true && refCount === 0) {
        worker.terminate();
        URL.revokeObjectURL(url);
        subscriber.complete();
      }
    };

    const subscription = source.subscribe(
      value => {
        refCount++;
        worker.postMessage(value);
      },
      err => subscriber.error(err),
      () => {
        terminate = true;
        completeIfDone();
      }
    );

    worker.onerror = err => {
      subscriber.error(err);
      err.preventDefault();
      refCount--;
      completeIfDone();
    };

    worker.onmessage = ({ data }) => {
      subscriber.next(data);
      refCount--;
      completeIfDone();
    };

    return {
      unsubscribe() {
        subscription.unsubscribe();
        worker.terminate();
        URL.revokeObjectURL(url);
      },
    };
  });
}
