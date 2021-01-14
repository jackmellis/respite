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
  MaybePromise,
} from '@respite/core';
import { useEffect, useMemo, useRef, useState } from 'react';
import read from './read';
import makeFetch from './fetch';
import useSyncQueryState from './useSyncQueryState';

const write = (cache: Cache, deps: Deps) => <T>(data: T) => {
  cache.success(deps, data);
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface QueryOptions<T> {
  eager?: boolean,
  prefetch?: boolean,
  ttl?: number,
  retry?: (err: any, tries: number) => (boolean | Promise<any>),
}

export default function useQuery<T>(
  key: Key,
  callback?: CallbackType<T>,
  deps: any[] = [],
  options: QueryOptions<T> = {},
): Query<T> {
  deps = [ key, ...deps ];
  const cache = useCache();
  const query = cache.getQuery<T>(deps);
  const [ state, setState ] = useState(query);

  const {
    status,
    data,
    error,
  } = state;

  const fetch = makeFetch(cache, deps, callback, options.retry);

  const invalidate = () => {
    cache.invalidate({
      deps,
      exact: true,
    });
  };

  const reset = () => {
    invalidate();
    setState({
      ...state,
      status: Status.IDLE,
    });
  };

  const firstRenderRef = useRef(true);
  useEffect(() => {
    if (firstRenderRef.current) {
      firstRenderRef.current = false;
    } else {
      reset();
    }
  }, [ key ]);

  useSyncQueryState(query, state, setState);

  useSubscribe(deps, options.ttl);

  if (options.eager) {
    const promise = cache.getPromise(deps);
    if (query.status === Status.IDLE && !promise) {
      read<T>(query.status, status, fetch, cache, deps, data, error)();
    }
  }
  if (options.prefetch) {
    useEffect(() => {
      const promise = cache.getPromise(deps);
      if (query.status === Status.IDLE && !promise) {
        fetch();
      }
    }, [ query.status ]);
  }

  return useMemo(() => {
    const r: InternalQuery<T> = {
      // state
      status,
      data: null,
      // methods
      invalidate,
      reset,
      // internal
      deps,
      fetch,
    };
    Object.defineProperty(r, 'data', {
      get: read<T>(query.status, status, fetch, cache, deps, data, error),
      set: write(cache, deps),
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(r, '$$isQuery', {
      value: true,
    });
    return r;
  }, [ status, query.status, data, error, ...deps ]);
}
