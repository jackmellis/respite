import { useEffect } from 'react';
import { ActionType } from '../constants';
import { Context } from '../types';
import { compareDeps } from '../utils';

export default function useCleanup(context: Context<any>, cacheTime: number, interval: number = 60000) {
  useEffect(() => {
    const handle = setInterval(() => {
      const { dispatch, subscribers } = context;
      const now = new Date().getTime();

      const unusedSubs = subscribers.filter(s => {
        // if the query  has a ttl we should remove it even if it's being listened to
        // this will cause a refetch on the next render
        if (s.ttl != null && !s.promise && s.created.getTime() + s.ttl < now) {
          return true;
        }
        // if the query is still in use we should leave it
        if (s.subscribers > 0 || s.promise || cacheTime === Infinity) {
          return false;
        }
        // if the query is not in use and has expired, we can remove it
        if (s.created.getTime() + cacheTime < now) {
          return true;
        }
      });

      if (unusedSubs.length) {
        unusedSubs.forEach(sub => {
          subscribers.splice(subscribers.indexOf(sub), 1);
        });
  
        dispatch({
          type: ActionType.INVALIDATE,
          deps: null,
          predicate: query => {
            return unusedSubs.some(sub => compareDeps(sub.deps, query.deps));
          },
        });
      }

      return () => clearInterval(handle);
    }, interval);
  }, []);
}