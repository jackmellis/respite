import { useEffect } from 'react';
import { Deps, QueryState } from '../types';
import useCache from './useCache';

export default function useSubscribe(callback: (query: QueryState<any>) => void, deps: Deps, ttl?: number) {
  const cache = useCache();

  useEffect(() => {
    const query = cache.getQuery<any>(deps);
    const fn = (query: QueryState<any>) => callback(query);
    
    query.subscribers.push(fn);
    if (ttl != null) {
      query.ttl = ttl;
    }

    return () => {
      const i = query.subscribers.indexOf(fn);
      if (i >= 0) {
        query.subscribers.splice(i, 1);
      }
    };
  }, deps);
}