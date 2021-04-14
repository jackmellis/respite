import { createContext } from 'react';
import type { Deps, RespiteConfig, PubSub } from '../types';
import type { Action } from './reducer';
import type { SyncPromise } from '..';
import { Status } from '../constants';

export interface QueryState<T> {
  deps: Deps,
  status: Status,
  data: T,
  error: any,
  promise: Promise<T> | SyncPromise<T>,
  created: Date,
  subscribers: number,
}

export type State<T> = QueryState<T>[];

export interface Context<T> {
  config: RespiteConfig,
  queries: QueryState<T>[],
  dispatch(action: Action<T>): void,
  pubSub: PubSub,
}

export default createContext<Context<any>>(void 0);
