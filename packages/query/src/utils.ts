import { Deps, isSyncPromise, Key, QueryState, Status } from '@respite/core';
import { MutableRefObject, useEffect, useRef } from 'react';
import makeFetch from './fetch';
import read from './read';
import syncQueryState from './syncQueryState';

export const isQueryExpired = <T>(query: QueryState<T>, ttl?: number) => {
  if (ttl == null || (query.status !== Status.ERROR && query.status !== Status.SUCCESS)) {
    return false;
  }
  const now = new Date().getTime();
  const expires = query.created.getTime() + (ttl || 10);
  return expires < now;
};

export const useReset = (key: Key, reset: () => void) => {
  const firstRenderRef = useRef(true);

  useEffect(() => {
    if (firstRenderRef.current) {
      firstRenderRef.current = false;
      return;
    }
    reset();
  }, [ key ]);
};

export const useSyncQueryState = <T>(
  query: QueryState<T>,
  ref: MutableRefObject<QueryState<T>>,
  rerender: () => void,
  deps: Deps,
) => {
  const firstRenderRef = useRef(true);

  useEffect(() => {
    if (firstRenderRef.current) {
      firstRenderRef.current = false;
      return;
    }
    syncQueryState(query, ref, rerender);
  }, deps);
};

export const useTtl = <T>(query: QueryState<T>, invalidate: () => void, ttl?: number) => {
  useEffect(() => {
    if (isQueryExpired(query, ttl)) {
      invalidate();
    }
  });
};

export const eagerlyFetchQuery = <T>(
  query: QueryState<T>,
  ref: MutableRefObject<QueryState<T>>,
  fetch: ReturnType<typeof makeFetch>,
  suspendOnRefetch?: boolean,
) => {
  const { promise } = query;
  if (query.status === Status.IDLE && !promise) {
    const data = read<T>(query, ref, fetch, suspendOnRefetch)();
    if (isSyncPromise(query.promise)) {
      query.status = Status.SUCCESS;
      query.data = data;
      ref.current = { ...query };
    }
  }
};

export const usePrefetch = <T>(query: QueryState<T>, fetch: ReturnType<typeof makeFetch>) => {
  useEffect(() => {
    if (query.status === Status.IDLE && !query.promise) {
      fetch(true);
    }
  }, [ query.status ]);
};