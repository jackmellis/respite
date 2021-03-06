import { useMemo } from 'react';
import useContext from './useContext';
import { getQueryByDeps } from '../utils';
import type SyncPromise from '../utils/SyncPromise';
import type { Deps, Key, QueryState } from '../types';
import { ActionType, Status } from '../constants';

export interface Cache {
  getQuery<T>(deps: Deps): QueryState<T>,
  getPromise<T>(deps: Deps): Promise<T> | SyncPromise<T>,
  setPromise<T>(deps: Deps, promise: Promise<T> | SyncPromise<T>): void,
  fetching(deps: Deps): void,
  success<T>(deps: Deps, data: T): void,
  failure(deps: Deps, error: any): void,
  invalidate(args: {
    key?: Key,
    deps?: Deps,
    exact?: boolean,
    predicate?: <T>(query: QueryState<T>) => boolean,
  }): void;
}

export default function useCache(): Cache {
  const { queries, dispatch } = useContext<any>();

  const getQuery = <T>(deps: Deps) => {
    let [ query ] = getQueryByDeps<T>(queries, deps);

    if (query == null) {
      query = {
        status: Status.IDLE,
        deps,
        data: void 0,
        error: void 0,
        created: new Date(),
        promise: undefined,
        subscribers: 0,
      };
      queries.push(query);
    }
    
    return query;
  };
  const getPromise = <T>(deps: Deps) => {
    return getQuery<T>(deps).promise;
  };
  const setPromise = <T>(deps: Deps, promise: Promise<T> | SyncPromise<T>) => {
    const query = getQuery<T>(deps);
    query.promise = promise;
    query.created = new Date();
  };
  const fetching = (deps: Deps) => {
    dispatch({
      type: ActionType.FETCHING,
      deps,
    });
  };
  const success = <T>(deps: Deps, data: T) => {
    dispatch({
      type: ActionType.SUCCESS,
      deps,
      data,
    });
  };
  const failure = (deps: Deps, error: any) => {
    dispatch({
      type: ActionType.FAILURE,
      deps,
      error,
    });
  };
  const invalidate = (props: {
    key?: Key,
    deps?: Deps,
    exact?: boolean,
    predecate?: <T>(query: QueryState<T>) => boolean,
  }) => {
    dispatch({
      type: ActionType.INVALIDATE,
      ...props,
    });
  };

  return useMemo(() => ({
    getQuery,
    getPromise,
    setPromise,
    fetching,
    success,
    failure,
    invalidate,
  }), [ queries, dispatch ]);
}
