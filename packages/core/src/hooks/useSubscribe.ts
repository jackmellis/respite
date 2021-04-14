import { useEffect } from 'react';
import { PubSubEvent } from '../constants';
import { Deps, QueryState } from '../types';
import useCache from './useCache';
import usePubSub from './usePubSub';

export default function useSubscribe(callback: (query: QueryState<any>) => void, deps: Deps) {
  const cache = useCache();
  const pubSub = usePubSub();

  useEffect(() => {
    const query = cache.getQuery<any>(deps);

    query.subscribers++;
    const unsubscribe = pubSub.subscribe<QueryState<any>>(PubSubEvent.INVALIDATE_QUERY, q => {
      if (q === query) {
        callback(query);
      }
    });

    return () => {
      query.subscribers--;
      unsubscribe();
    };
  }, deps);
}