import { Status } from '../constants';

export type { Context, Subscriber } from '../context/context';
export type { Action, QueryState, State } from '../context/reducer';
export type { Cache } from '../hooks/useCache';

export type DeepPartial<T> = T extends Function
  ? T
  : T extends object
  ? { [P in keyof T]?: DeepPartial<T[P]> }
  : T;

export type AnyFunction = (...args: any[]) => any;

export type CallbackType<T> = () => MaybePromise<T>;

export type Key = any;

export type Deps = any[];

export type MaybePromise<T> = Promise<T> | T;

export interface RespiteConfig {
  queries: QueryOptions;
}

export interface QueryOptions {
  eager: boolean;
  prefetch: boolean;
  ttl?: number;
  retry(err: any, tries: number): boolean | Promise<any>;
  suspendOnRefetch: boolean;
}

export interface Query<T> {
  status: Status;
  data: T;
  resolve(): Promise<T>;
  reset(): void;
  invalidate(): void;
}

export interface InternalQuery<T> extends Query<T> {
  deps: Deps;
  fetch(): any;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface Quark<T> {}

export interface Atom<T> extends Quark<T> {
  default: T;
}

export interface InternalAtom<T> extends Atom<T>, Quark<T> {
  getState(): [T, (value: T) => void];
}

interface MoleculeGetCallback<T> {
  (fn: () => MaybePromise<T>, deps?: any[]): MaybePromise<T>;
  get<U>(atom: Atom<U>): U;
  get<U>(atom: Molecule<U, []>): U;
  get<U, D extends any[]>(atom: Molecule<U, D>, deps: D): U;
}
interface MoleculeSetCallback<T> {
  (fn: (value: T) => MaybePromise<any>, deps?: any[]): () => void;
  get<U>(atom: Atom<U>): U;
  get<U>(atom: Molecule<U, []>): U;
  get<U, D extends any[]>(atom: Molecule<U, D>, deps: D): U;
  set<U>(atom: Atom<U>): (value: U) => void;
  set<U>(atom: Molecule<U, []>): (value: U) => void;
  set<U, D extends any[]>(atom: Molecule<U, D>, deps: D): (value: U) => void;
}

export interface Molecule<T, D extends any[] = any[]> extends Quark<T> {
  get(
    callback: MoleculeGetCallback<T>,
    args: D
  ): MaybePromise<T> | (() => MaybePromise<T>);
  set(
    callback: MoleculeSetCallback<T>,
    args: D
  ): (value: T) => MaybePromise<any>;
}

export interface InternalMolecule<T, D extends any[] = any[]>
  extends Molecule<T, D>,
    Quark<T> {
  getState(args: D): [T, (value: T) => void];
}
