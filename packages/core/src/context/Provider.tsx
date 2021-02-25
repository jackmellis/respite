import React, { ReactNode } from 'react';
import context, { Context } from './context';
import reducer from './reducer';
import { useCleanup } from '../hooks';
import { RespiteConfig } from '../types';

interface Props extends Partial<RespiteConfig> {
  cacheTime?: number,
  children: ReactNode,
}

export default function Provider ({
  cacheTime = 1000 * 60 * 3,
  children,
  ...config
}: Props) {
  const [ state, dispatch ] = reducer();
  const subscribers = React.useRef([]).current;
  const value = React.useMemo<Context<any>>(() => ({
    state,
    dispatch,
    subscribers,
    config: {
      ...config,
      queries: {
        eager: false,
        prefetch: false,
        retry: () => false,
        ...config?.queries,
      },
    },
  }), [ state ]);

  useCleanup(value, cacheTime);

  return (
    <context.Provider value={value}>
      {children}
    </context.Provider>
  );
}