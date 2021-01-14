import { Atom } from '@respite/core';
import { useQuery } from '@respite/query';

export default function useReset<T>(atom: Atom<T>) {
  const query = useQuery(atom, () => atom.default);
  return query.reset;
}