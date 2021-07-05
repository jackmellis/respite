import {
  Cache,
  CallbackType,
  Deps,
  Key,
  Status,
  useCache,
  useSubscribe,
  Query,
  InternalQuery,
  isSyncPromise,
  useConfig,
  QueryState,
} from '@respite/core';
import { useMemo, useRef, useState } from 'react';
import read from './read';
import makeFetch from './fetch';
import syncQueryState from './syncQueryState';
import { QueryOptions } from './types';
import { eagerlyFetchQuery, usePrefetch, useReset, useSyncQueryState, useTtl } from './utils';

const write = (cache: Cache, deps: Deps) => <T>(data: T) => {
  cache.success(deps, data);
};

export default function useQuery<T>(
  key: Key,
  callback?: CallbackType<T>,
  deps: any[] = [],
  options?: QueryOptions,
): Query<T> {
  deps = [ key, ...deps ];
  const cache = useCache();
  const query = cache.getQuery<T>(deps);
  const ref = useRef<QueryState<T>>({ ...query });
  const [ state, setState ] = useState({ ...ref.current });
  const rerender = () => setState({ ...ref.current });

  options = {
    ...useConfig().queries,
    ...options,
  };

  const fetch = makeFetch(cache, deps, callback, options.retry);

  const invalidate = () => {
    cache.invalidate({
      deps,
      exact: true,
    });
  };

  const reset = () => {
    invalidate();
    ref.current = {
      ...ref.current,
      status: Status.IDLE,
    };
    rerender();
  };

  const resolve = () => {
    const { status, promise, data } = query;
    if (status === Status.SUCCESS) {
      return Promise.resolve(data);
    }
    if (promise == null) {
      return Promise.resolve(fetch(false));
    }
    if (isSyncPromise(promise)) {
      return Promise.resolve(promise.value);
    }
    return promise;
  };

  useReset(key, reset);
  useSyncQueryState(query, ref, rerender, deps);
  useTtl(query, invalidate, rerender, options.ttl);
  useSubscribe(newQuery => {
    syncQueryState(newQuery, ref, rerender);
  }, deps);

  if (options.eager) {
    eagerlyFetchQuery(query, ref, fetch, options.suspendOnRefetch);
  }
  if (options.prefetch) {
    usePrefetch(query, fetch);
  }

  return useMemo(() => {
    const r: InternalQuery<T> = {
      // state
      status: ref.current.status,
      data: null,
      // methods
      invalidate,
      reset,
      resolve,
      // internal
      deps,
      fetch,
    };
    Object.defineProperty(r, 'data', {
      get: read<T>(query, ref, fetch, options.suspendOnRefetch),
      set: write(cache, deps),
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(r, '$$isQuery', {
      value: true,
    });
    return r;
  }, [ query.status, state, ...deps ]);
}
