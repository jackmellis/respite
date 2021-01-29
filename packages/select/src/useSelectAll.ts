/* eslint-disable no-redeclare */
/* eslint-disable max-len */
import {
  InternalQuery,
  Query,
  Status,
  Quark,
  Atom,
  Molecule,
  isAtom,
  isMolecule,
  isQuery,
  getInternalAtom,
} from '@respite/core';
import { useMemo } from 'react';

// TODO: async selectors...

const statusOrder = [
  Status.ERROR,
  Status.SUCCESS,
  Status.FETCHING,
  Status.LOADING,
  Status.IDLE,
];

function multiQueryGetter<T, R>(queries: [ Query<T> ], selector: (t: T) => R, deps?: any[]): Query<R>;
function multiQueryGetter<T, U, R>(queries: [ Query<T>, Query<U> ], selector: (t: T, u: U) => R, deps?: any[]): Query<R>;
function multiQueryGetter<T, U, V, R>(queries: [ Query<T>, Query<U>, Query<V> ], selector: (t: T, u: U, v: V) => R, deps?: any[]): Query<R>;
function multiQueryGetter<T, U, V, W, R>(queries: [ Query<T>, Query<U>, Query<V>, Query<W> ], selector: (t: T, u: U, v: V, w: W) => R, deps?: any[]): Query<R>;
function multiQueryGetter<T, U, V, W, X, R>(queries: [ Query<T>, Query<U>, Query<V>, Query<W>, Query<X> ], selector: (t: T, u: U, v: V, w: W, x: X) => R, deps?: any[]): Query<R>;
function multiQueryGetter<T, R>(queries: Query<T>[], selector: (...t: T[]) => R, deps?: any[]): Query<R>;
function multiQueryGetter<T, R>(
  queries: Array<Query<T>>,
  selector: (...args: T[]) => R,
  deps: any[],
): Query<R> {
  return useMemo(() => {
    const status = queries.reduce((status, query) => {
      if (statusOrder.indexOf(query.status) > statusOrder.indexOf(status)) {
        return query.status;
      }
      return status;
    }, statusOrder[0]);
  
    const result: InternalQuery<R> = {
      // state
      status,
      data: null,
      // methods
      invalidate: () => queries.forEach(query => query.invalidate),
      reset: () => queries.forEach(query => query.reset),
      // internal
      deps: queries,
      fetch: () => queries.forEach((query: InternalQuery<T>) => query.fetch()),
      // @ts-ignore
      resolve: () => Promise.all(queries.map(query => query.resolve())),
    };
    Object.defineProperty(result, '$$isQuery', { value: true });
    Object.defineProperty(result, 'data', {
      get() {
        return selector(...queries.map(query => query.data));
      },
    });
    return result;
  }, [ ...queries, ...deps ]);
}

function multiAtomSelector<T, R>(atoms: [ Atom<T> | Molecule<T> ], selector: (t: T) => R, deps?: any[]): R;
function multiAtomSelector<T, U, R>(atoms: [ Atom<T> | Molecule<T>, Atom<U> | Molecule<U> ], selector: (t: T, u: U) => R, deps?: any[]): R;
function multiAtomSelector<T, U, V, R>(atoms: [ Atom<T> | Molecule<T>, Atom<U> | Molecule<U>, Atom<V> | Molecule<V> ], selector: (t: T, u: U, v: V) => R, deps?: any[]): R;
function multiAtomSelector<T, U, V, W, R>(atoms: [ Atom<T> | Molecule<T>, Atom<U> | Molecule<U>, Atom<V> | Molecule<V>, Atom<W> | Molecule<W> ], selector: (t: T, u: U, v: V, w: W) => R, deps?: any[]): R;
function multiAtomSelector<T, U, V, W, X, R>(atoms: [ Atom<T> | Molecule<T>, Atom<U> | Molecule<U>, Atom<V> | Molecule<V>, Atom<W> | Molecule<W>, Atom<X> | Molecule<X> ], selector: (t: T, u: U, v: V, w: W, x: X) => R, deps?: any[]): R;
function multiAtomSelector<T, R>(atoms: Array<Atom<T> | Molecule<T>>, selector: (...args: T[]) => R, deps?: any[]): R;
function multiAtomSelector<T, R>(atoms: Array<Atom<T> | Molecule<T>>, selector: (...args: T[]) => R, deps: any[] = []): R {
  const seeds = atoms.map(atom => getInternalAtom(atom).getState(deps)[0]);
  return useMemo(() => selector(...seeds), [ ...seeds, ...deps ]);
}

type UseSelectAll = typeof multiQueryGetter & typeof multiAtomSelector;
const useSelectAll: UseSelectAll = (
  query: Array<Query<any>> | Array<Quark<any>>,
  selector: any,
  deps: any[] = [],
): any => {
  if (Array.isArray(query)) {
    if (isQuery(query[0])) {
      return multiQueryGetter(<Array<Query<any>>>query, selector, deps);
    } else if (isAtom(query[0]) || isMolecule(query[0])) {
      return multiAtomSelector(query as any[], selector, deps);
    }
  }

  throw new Error('Unknown/invalid query passed to useSelectAll');
};

export default useSelectAll;