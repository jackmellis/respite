import { Atom, Molecule, Quark } from '@respite/core';
import useState from './useState';

function useValue<T>(atom: Atom<T>): T;
function useValue<T>(molecule: Molecule<T, []>): T;
function useValue<T, D extends any[]>(molecule: Molecule<T, D>, deps: D): T;
function useValue<T>(quark: Quark<T>, deps?: any[]): T {
  // @ts-ignore
  return useState(quark, deps)[0];
}

export default useValue;