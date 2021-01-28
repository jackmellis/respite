import { Atom } from '@respite/core';
import { useQuery } from '@respite/query';
import { useCallback, useEffect, useRef } from 'react';

function getState<T>(this: Atom<T>): [ T, (value: T) => void ] {
  // eslint-disable-next-line no-invalid-this
  const atom = this;
  const query = useQuery(atom, () => atom.default);
  const state = query.data;

  // this is definitely not a hack...
  // so you would always expect a setState function to be memoized forever as per react's useState
  // but we actually want the setState to update the query object which is quite likely to change
  // as its data is updated. So to work around this, we have a perma-memoized setState function
  // but then we actually store the "real" setState function in a ref so we can update it on the fly
  // without triggering an additional render

  const ref = useRef((value: T) => {
    query.data = value;
  });

  useEffect(() => {
    ref.current = (value: T) => {
      query.data = value;
    };
  }, [ query ]);

  const setState = useCallback((value: T) => {
    return ref.current(value);
  }, []);

  return [ state, setState ];
}

export default function atom<T>(config: Partial<Atom<T>> = {}): Atom<T> {
  const atom = {
    default: void 0,
    ...config,
  };
  Object.defineProperty(atom, '$$atom', { value: true });
  Object.defineProperty(atom, 'getState', { value: getState });
  return atom;
}
