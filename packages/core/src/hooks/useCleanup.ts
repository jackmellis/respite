import { useEffect } from 'react';
import { ActionType } from '../constants';
import { Action, Context, QueryState } from '../types';

const isQueryInUse = (query: QueryState<any>, cacheTime: number) => {
  if (query.subscribers.length > 0 || query.promise || cacheTime === Infinity) {
    return true;
  }
  return false;
};
const isQueryTTlExpired = (query: QueryState<any>, now: number) => {
  if (query.ttl != null && query.promise == null && query.created.getTime() + query.ttl < now) {
    return true;
  }
  return false;
};
const isQueryExpired = (query: QueryState<any>, cacheTime: number, now: number) => {
  if (query.created.getTime() + cacheTime < now) {
    return true;
  }
  return false;
};
const invalidateQuery = (
  query: QueryState<any>,
  dispatch: (action: Action<any>,
  ) => void) => {
  // console.log(query);
  dispatch({
    type: ActionType.INVALIDATE,
    deps: null,
    predicate: q => q === query,
  });
};
const removeQuery = (query: QueryState<any>, queries: QueryState<any>[]) => {
  const i = queries.indexOf(query);
  if (i >= 0) {
    queries.splice(queries.indexOf(query), 1);
  }
};

export default function useCleanup(context: Context<any>, cacheTime: number, interval: number = 60000) {
  useEffect(() => {
    const handle = setInterval(() => {
      const { dispatch, queries } = context;
      const now = new Date().getTime();

      queries.forEach(query => {
        // if the query  has a ttl we should remove it even if it's being listened to
        // this will cause a refetch on the next render
        if (isQueryTTlExpired(query, now)) {
          if (isQueryInUse(query, cacheTime)) {
            invalidateQuery(query, dispatch);
          } else {
            removeQuery(query, queries);
          }
        }
        // if the query is still in use we should leave it
        if (isQueryInUse(query, cacheTime)) {
          return;
        }
        // if the query is not in use and has expired, we can remove it
        if (isQueryExpired(query, cacheTime, now)) {
          removeQuery(query, queries);
        }
      });

      return () => clearInterval(handle);
    }, interval);
  }, []);
}