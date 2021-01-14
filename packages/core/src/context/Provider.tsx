import React, { ReactNode } from 'react';
import context, { Context } from './context';
import reducer from './reducer';
import { useCleanup } from '../hooks';

interface Props {
  cacheTime?: number,
  children: ReactNode,
}

export default function Provider ({
  cacheTime = 1000 * 60 * 3,
  children,
}: Props) {
  const [ state, dispatch ] = reducer();
  const subscribers = React.useRef([]).current;
  const value = React.useMemo<Context<any>>(() => ({
    state,
    dispatch,
    subscribers,
  }), [ state ]);

  useCleanup(value, cacheTime);

  return (
    <context.Provider value={value}>
      {children}
    </context.Provider>
  );
}