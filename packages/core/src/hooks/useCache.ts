import { useEffect, useMemo, useRef } from 'react';
import useContext from './useContext';
import { getQueryByDeps, getSub } from '../utils';
import type SyncPromise from '../utils/SyncPromise';
import type { AnyFunction, Deps, Key, QueryState, Subscriber } from '../types';
import { ActionType, Status } from '../constants';

export interface Cache {
  getQuery<T>(deps: Deps): QueryState<T>,
  getPromise<T>(deps: Deps): Promise<T> | SyncPromise<T>,
  setPromise<T>(deps: Deps, promise: Promise<T> | SyncPromise<T>): void,
  getSubscriber<T>(deps: Deps): Subscriber<T>,
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
  const { state, dispatch, subscribers } = useContext<any>();

  // @ts-ignore
  const onlyWhenMounted = <F extends AnyFunction>(fn: F): F => (...args: Parameters<F>): ReturnType<F> => {
    if (mountedRef.current) {
      return fn(...args);
    }
  };

  const getQuery = <T>(deps: Deps) => {
    let [ query ] = getQueryByDeps<T>(state, deps);
    if (query != null) {
      const sub = getSub<T>(subscribers, deps);
      if (sub != null && sub.ttl != null && !sub.promise && sub.created.getTime() + sub.ttl < new Date().getTime()) {
        query = null;
      }
    }
    
    return query ?? {
      status: Status.IDLE,
      deps,
      data: null,
      error: null,
    };
  };
  const getSubscriber = <T>(deps: Deps) => {
    let sub = getSub<T>(subscribers, deps);
    if (sub == null) {
      sub = {
        deps,
        promise: null,
        subscribers: 0,
        created: new Date(),
      };
      subscribers.push(sub);
    }
    return sub;
  };
  const getPromise = <T>(deps: Deps) => {
    return getSub<T>(subscribers, deps)?.promise;
  };
  const setPromise = <T>(deps: Deps, promise: Promise<T> | SyncPromise<T>) => {
    const sub = getSubscriber<T>(deps);
    sub.promise = promise;
    sub.created = new Date();
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
    setPromise(deps, null);
  });
  const failure = onlyWhenMounted((deps: Deps, error: any) => {
    dispatch({
      type: ActionType.FAILURE,
      deps,
      error,
    });
    setPromise(deps, null);
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
    getSubscriber,
    getPromise,
    setPromise,
    fetching,
    success,
    failure,
    invalidate,
  }), [ state, dispatch ]);
}
