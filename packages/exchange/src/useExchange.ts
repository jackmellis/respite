import { useEffect } from 'react';
import { Key, useCache, usePubSub, PubSubEvent } from '@respite/core';

export default function useExchange(...exchanges: Array<[ queryKeys: Key[] | Key, actionKeys: Key[] | Key ]>) {
  const pubSub = usePubSub();
  const cache = useCache();

  useEffect(() => {
    const unsubscribers: Array<() => void> = [];

    exchanges.forEach(([ queryOrQueries, actionOrActions ]) => {
      const actionKeys = [].concat(actionOrActions);
      const queryKeys = [].concat(queryOrQueries);

      actionKeys.forEach(actionKey => {
        const unsubscribe = pubSub.subscribe(PubSubEvent.ACTION_FULFILLED, (key: Key) => {
          if (key === actionKey) {
            queryKeys.forEach(key => {
              cache.invalidate({key});
            });
          }
        });

        unsubscribers.push(unsubscribe);
      });
    });

    return () => {
      unsubscribers.forEach(unsubscribe => unsubscribe());
    };
  }, []);
}