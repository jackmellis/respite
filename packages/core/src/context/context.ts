import { createContext, Dispatch } from 'react';
import type { Deps, RespiteConfig } from '../types';
import type { Action, State } from './reducer';
import type { SyncPromise } from '..';

export interface Subscriber<T> {
  deps: Deps,
  subscribers: number,
  promise: Promise<T> | SyncPromise<T>,
  created: Date,
  ttl?: number,
}

export interface Context<T> {
  subscribers: Subscriber<T>[],
  dispatch: Dispatch<Action<T>>,
  state: State<T>,
  config: RespiteConfig;
}

export default createContext<Context<any>>(void 0);
