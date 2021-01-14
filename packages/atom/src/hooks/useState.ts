import {
  Atom,
  Molecule,
  Quark,
  isAtom,
  isMolecule,
  InternalMolecule,
  getInternalAtom,
} from '@respite/core';

type StateTuple<T> = [ T, (value: T) => void ];

function useAtomState<T>(atom: Atom<T>): StateTuple<T>;
function useAtomState<T>(atom: Atom<T>) {
  return getInternalAtom(atom).getState();
}

function useMoleculeState<T>(molecule: Molecule<T, []>): StateTuple<T>;
function useMoleculeState<T, D extends any[]>(molecule: Molecule<T, D>, deps: D): StateTuple<T>;
function useMoleculeState<T, D extends any[]>(molecule: InternalMolecule<T, D>, args: D = <D>[]): StateTuple<T> {
  return molecule.getState(args);
}

function useState<T>(quark: Quark<T>, deps?: any[]): StateTuple<T> {
  if (isAtom<T>(quark)) {
    return useAtomState(quark);
  }
  if (isMolecule<T>(quark)) {
    return useMoleculeState(quark, deps);
  }
  throw new Error('Only call @respite/atom\'s useState with an atom or molecule');
}

export default useState as (typeof useAtomState & typeof useMoleculeState);