import {
  Key,
  MaybePromise,
  Query,
  Status,
  SyncPromise,
  useCache,
  useConfig,
} from '@respite/core';
import { useCallback, useRef } from 'react';
import { QueryOptions } from './types';
import { isQueryExpired } from './utils';

export default function useQueryCallback<T, D extends any[]>(
  key: Key,
  callback: (deps: D) => MaybePromise<T>,
  options?: QueryOptions,
) {
  options = {
    ...useConfig().queries,
    ...options,
  };
  const cache = useCache();
  // callback will change on every render, but we want to be able to
  // memoize queryCallback for the consumer. This is definitely a bit
  // of a hack right now but it beats infinite renders
  const ref = useRef(callback);
  ref.current = callback;

  async function queryCallback(deps: D): Promise<Query<T>> {
    const depsWithKey = [ key, ...deps ];
    let q = cache.getQuery<T>(depsWithKey);

    if (q.status === Status.SUCCESS && isQueryExpired(q, options.ttl) === false) {
      // already fetched / cached / etc.
    } else if (q.status === Status.LOADING) {
      // we're already fetching the data from somewhere else
      // so let's just wait on that promise to resove
      const promise = q.promise;
      // it's highly unlikely that promise will be a SyncPromise but there could
      // be some freak race condition where this would be the case
      const data = promise instanceof SyncPromise ? promise.value : await promise;
      q = {
        ...q,
        status: Status.SUCCESS,
        data,
      };
    } else {
      // the query is either idle or errored, either way we want to fetch the data
      const promise = Promise.resolve(ref.current(deps));
      cache.setPromise<T>(depsWithKey, promise);
      cache.fetching(depsWithKey);
      const data = await promise;
      cache.success(depsWithKey, data);
      cache.setPromise<T>(depsWithKey, null);

      q = {
        ...q,
        status: Status.SUCCESS,
        data,
        error: void 0,
      };
    }

    const query: Query<T> = {
      status: q.status,
      data: q.data,
      invalidate: () => cache.invalidate({ key, deps }),
      reset: () => cache.invalidate({ key, deps }),
      resolve: async() => q.data,
    };

    return query;
  }

  return useCallback(queryCallback, [ cache ]);
}