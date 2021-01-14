import { Atom } from '@respite/core';
import { useQuery } from '@respite/query';

function getState<T>(this: Atom<T>): [ T, (value: T) => void ] {
  // eslint-disable-next-line no-invalid-this
  const atom = this;
  const query = useQuery(atom, () => atom.default);
  const state = query.data;

  const setState = (value: T) => {
    query.data = value;
  };
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
