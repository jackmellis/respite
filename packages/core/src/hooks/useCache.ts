import { useEffect, useMemo, useRef } from 'react';
import useContext from './useContext';
import { getQueryByDeps } from '../utils';
import type SyncPromise from '../utils/SyncPromise';
import type { AnyFunction, Deps, Key, QueryState, Subscriber } from '../types';
import { ActionType, Status } from '../constants';

export interface Cache {
  getQuery<T>(deps: Deps): QueryState<T>,
  getPromise<T>(deps: Deps): Promise<T> | SyncPromise<T>,
  setPromise<T>(deps: Deps, promise: Promise<T> | SyncPromise<T>): void,
  getSubscribers<T>(deps: Deps): Subscriber<T>[],
  fetching(deps: Deps): void,
  success<T>(deps: Deps, data: T): void,
  failure(deps: Deps, error: any): void,
  invalidate(args: {
    key?: Key,
    deps?: Deps,
    exact?: boolean,
    predicate?: <T>(query: QueryState<T>) => boolean,
  }): void,
}

export default function useCache(): Cache {
  const mountedRef = useRef(true);
  const { queries, dispatch } = useContext<any>();

  // @ts-ignore
  const onlyWhenMounted = <F extends AnyFunction>(fn: F): F => (...args: Parameters<F>): ReturnType<F> => {
    if (mountedRef.current) {
      return fn(...args);
    }
  };

  const getQuery = <T>(deps: Deps) => {
    let [ query, i ] = getQueryByDeps<T>(queries, deps);
    if (
      query != null &&
      query.ttl != null &&
      query.promise == null &&
      query.created.getTime() + query.ttl < new Date().getTime()
    ) {
      queries.splice(i, 1);
      query = null; 
    }

    if (query == null) {
      query = {
        status: Status.IDLE,
        deps,
        data: void 0,
        error: void 0,
        created: new Date(),
        promise: undefined,
        subscribers: [],
      };
      queries.push(query);
    }
    
    return query;
  };
  const getSubscribers = <T>(deps: Deps) => {
    return getQuery<T>(deps).subscribers;
  };
  const getPromise = <T>(deps: Deps) => {
    return getQuery<T>(deps).promise;
  };
  const setPromise = <T>(deps: Deps, promise: Promise<T> | SyncPromise<T>) => {
    const query = getQuery<T>(deps);
    query.promise = promise;
    query.created = new Date();
  };
  const fetching = onlyWhenMounted((deps: Deps) => {
    dispatch({
      type: ActionType.FETCHING,
      deps,
    });
  });
  const success = onlyWhenMounted(<T>(deps: Deps, data: T) => {
    dispatch({
      type: ActionType.SUCCESS,
      deps,
      data,
    });
  });
  const failure = onlyWhenMounted((deps: Deps, error: any) => {
    dispatch({
      type: ActionType.FAILURE,
      deps,
      error,
    });
  });
  const invalidate = onlyWhenMounted((props: {
    key?: Key,
    deps?: Deps,
    exact?: boolean,
    predecate?: <T>(query: QueryState<T>) => boolean,
  }) => {
    dispatch({
      type: ActionType.INVALIDATE,
      ...props,
    });
  });

  useEffect(() => () => {
    mountedRef.current = false;
  }, []);

  return useMemo(() => ({
    getQuery,
    getSubscribers,
    getPromise,
    setPromise,
    fetching,
    success,
    failure,
    invalidate,
  }), [ queries, dispatch ]);
}
