import {
  Status,
  isPromise,
  isSyncPromise,
  SyncPromise,
  QueryState,
} from '@respite/core';
import { MutableRefObject } from 'react';
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
  query: QueryState<T>,
  ref: MutableRefObject<QueryState<T>>,
  fetch: Fetch,
  suspendOnRefetch: boolean,
) {
  return () => {
    // if the query needs fetching but the local query has data, we just want to silently fetch in the background
    if (query.status === Status.IDLE && ref.current.status !== Status.IDLE && query.promise == null) {
      fetch(true);
    }

    switch (ref.current.status) {
    case Status.IDLE:
      return getResultFromIdle(query.promise, fetch);
    case Status.LOADING:
      throw ref.current.promise;
    case Status.FETCHING:
      if (suspendOnRefetch) {
        throw ref.current.promise;
      }
      return ref.current.data;
    case Status.SUCCESS:
      return ref.current.data;
    case Status.ERROR:
      if (query.promise != null) {
        throw query.promise;
      }
      throw ref.current.error;
    }
  };
}
