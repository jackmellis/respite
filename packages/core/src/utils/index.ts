import SyncPromise from './SyncPromise';
import { Atom, InternalAtom, InternalMolecule, Molecule, Query } from '../types';

export * from'./queries';

export const isPromise = <T>(x: any): x is Promise<T> => {
  return Object.prototype.toString.call(x) === '[object Promise]';
};

export const isSyncPromise = <T>(x: any): x is SyncPromise<T> => {
  return x instanceof SyncPromise;
};

export const isQuery = <T>(x: any): x is Query<T> => {
  return x?.$$isQuery === true;
};

export const isAtom = <T>(q: any): q is Atom<T> => {
  return q.$$atom;
};

export const isMolecule = <T, D extends any[] = []>(q: any): q is Molecule<T, D> => {
  return q.$$molecule;
};

export function getInternalAtom<T>(q: Atom<T>): InternalAtom<T>;
export function getInternalAtom<T, D extends any[] = any[]>(q: Molecule<T, D>): InternalMolecule<T, D>;
// eslint-disable-next-line max-len
export function getInternalAtom<T, D extends any[] = any[]>(q: Atom<T> | Molecule<T, D>): InternalAtom<T> | InternalMolecule<T, D>;
export function getInternalAtom(q: any) {
  return q;
}