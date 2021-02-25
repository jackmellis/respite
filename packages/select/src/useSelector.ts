/* eslint-disable no-redeclare */
/* eslint-disable max-len */
import {
  InternalQuery,
  Query,
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

function singleQueryGetter<T, R>(
  query: Query<T>,
  selector: (t: T) => R,
  deps?: any[],
): Query<R> {
  return useMemo(() => {
    const q = query as InternalQuery<T>;
    const result: InternalQuery<R> = {
      // state
      status: query.status,
      data: null,
      // methods
      invalidate: query.invalidate,
      reset: query.reset,
      resolve: () => query.resolve().then(selector),
      // internal
      deps: q.deps,
      fetch: q.fetch,
    };
    Object.defineProperty(result, '$$isQuery', { value: true });
    Object.defineProperty(result, 'data', {
      get() {
        return selector(query.data);
      },
    });
    return result;
  }, [ query, ...deps ]);
}

function singleAtomSelector<T, R>(atom: Atom<T> | Molecule<T>, selector: (t: T) => R, deps?: any[]): R;
function singleAtomSelector<T, R>(atom: Atom<T> | Molecule<T>, selector: (t: T) => R, deps: any[] = []): R {
  const [ state ] = getInternalAtom(atom).getState(deps);
  return useMemo(() => selector(state), [ state, ...deps ]);
}

type UseSelector = typeof singleQueryGetter & typeof singleAtomSelector;
const useSelector: UseSelector = (
  query: Query<any> | Quark<any>,
  selector: any,
  deps: any[] = [],
): any => {
  if (isQuery(query)) {
    return singleQueryGetter(query, selector, deps);
  } else if (isAtom(query) || isMolecule(query)) {
    return singleAtomSelector(query, selector, deps);
  }

  throw new Error('Unknown/invalid query passed to useSelector');
};

export default useSelector;