import { useEffect } from 'react';
import { Context, QueryState } from '../types';

const isQueryInUse = (query: QueryState<any>, cacheTime: number) => {
  if (query.subscribers > 0 || query.promise || cacheTime === Infinity) {
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
const removeQuery = (query: QueryState<any>, queries: QueryState<any>[]) => {
  const i = queries.indexOf(query);
  if (i >= 0) {
    queries.splice(queries.indexOf(query), 1);
  }
};

export default function useCleanup(context: Context<any>, cacheTime: number, interval: number = 60000) {
  useEffect(() => {
    const handle = setInterval(() => {
      const { queries } = context;
      const now = new Date().getTime();

      queries.forEach(query => {
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