import { useEffect } from 'react';
import { Deps } from '../types';
import useCache from './useCache';

export default function useSubscribe(deps: Deps, ttl?: number) {
  const cache = useCache();

  useEffect(() => {
    const sub = cache.getSubscriber(deps);
    sub.subscribers++;
    if (ttl != null) {
      sub.ttl = ttl;
    }

    return () => {
      sub.subscribers--;
    };
  }, deps);
}