import { Atom } from '@respite/core';
import { useQuery } from '@respite/query';

export default function useInitialize<T>(atom: Atom<T>, value: T) {
  useQuery(atom, () => value, [], { eager: true });
}