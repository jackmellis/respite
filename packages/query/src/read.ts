import {
  Cache,
  Deps,
  Status,
  isPromise,
  isSyncPromise,
  SyncPromise,
} from '@respite/core';
import makeFetch from './fetch';

type Fetch = ReturnType<typeof makeFetch>;

const getResultFromIdle = <T>(promise: Promise<T> | SyncPromise<T>, fetch: Fetch) => {
  // if promise is a SyncPromise it means we have a value already and we can just return it
  if (isSyncPromise(promise)) {
    return promise.value;
  }
  const result = fetch(true);
  // if fetch is asynchronous then we want to throw it and suspend the component
  if (isPromise(result)) {
    throw result;
  }
  return result;
};

export default function makeRead<T>(
  queryStatus: Status,
  localStatus: Status,
  fetch: Fetch,
  cache: Cache,
  deps: Deps,
  data: T,
  error: any,
) {
  return () => {
    // if the query needs fetching but the local query has data, we just want to silently fetch in the background
    const promise = cache.getPromise<T>(deps);
    if (queryStatus === Status.IDLE && localStatus !== Status.IDLE && promise == null) {
      fetch(true);
    }

    switch (localStatus) {
    case Status.IDLE:
      return getResultFromIdle(promise, fetch);
    case Status.LOADING:
      throw cache.getPromise(deps);
    case Status.FETCHING:
    case Status.SUCCESS:
      return data;
    case Status.ERROR:
      if (cache.getPromise(deps)) {
        throw cache.getPromise(deps);
      }
      throw error;
    }
  };
}
