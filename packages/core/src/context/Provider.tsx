import React, { ReactNode, useRef } from 'react';
import context, { Context } from './context';
import reducer from './reducer';
import { useCleanup } from '../hooks';
import { DeepPartial, RespiteConfig, State } from '../types';
import { createPubSub } from '../utils';

interface Props extends DeepPartial<RespiteConfig> {
  cacheTime?: number,
  children: ReactNode,
}

export default function Provider ({
  cacheTime = 1000 * 60 * 3,
  children,
  ...config
}: Props) {
  const stateRef = useRef<State<any>>([]);
  const pubSub = createPubSub();
  const [ queries, dispatch ] = reducer(stateRef.current, pubSub);
  const value = React.useMemo<Context<any>>(() => ({
    dispatch,
    queries,
    pubSub,
    config: {
      ...config,
      queries: {
        eager: false,
        prefetch: false,
        retry: () => false,
        suspendOnRefetch: false,
        ...config?.queries,
      },
    },
  }), [ queries, dispatch ]);

  useCleanup(value, cacheTime);

  return (
    <context.Provider value={value}>
      {children}
    </context.Provider>
  );
}