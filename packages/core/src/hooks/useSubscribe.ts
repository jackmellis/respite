import { useEffect } from 'react';
import { Deps } from '../types';
import { useContext } from '../hooks';
import { getSub } from '../utils';

export default function useSubscribe(deps: Deps, ttl?: number) {
  const { subscribers } = useContext<any>();

  useEffect(() => {
    let sub = getSub(subscribers, deps);
    if (sub == null) {
      sub = {
        deps,
        promise: null,
        subscribers: 0,
        created: new Date(),
      };
      subscribers.push(sub);
    }
    sub.subscribers++;
    if (ttl != null) {
      sub.ttl = ttl;
    }

    return () => {
      sub.subscribers--;
    };
  }, deps);
}