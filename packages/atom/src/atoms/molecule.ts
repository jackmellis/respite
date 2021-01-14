import { Atom, getInternalAtom, isPromise, MaybePromise, Molecule } from '@respite/core';
import { useQuery } from '@respite/query';

const getGetter = <T>(
  molecule: Molecule<T>,
  args: any[],
) => {
  let queryFn: () => MaybePromise<T>;
  let deps = args;

  const callback = (
    fn: () => MaybePromise<T>,
    qDeps: any[],
  ): MaybePromise<T> => {
    queryFn = fn;
    deps = qDeps;
    return null;
  };
  callback.get = (atom: Atom<any> | Molecule<any>, atomDeps: any[] = []) => {
    const [ value ] = getInternalAtom(atom).getState(atomDeps);
    deps = deps.concat(value);
    return value;
  };

  const result = molecule.get(callback, args);

  if (queryFn == null) {
    if (typeof result === 'function') {
      queryFn = <() => MaybePromise<T>>result;
    } else {
      queryFn = () => result;
    }
  }

  return [ queryFn, deps ] as [ typeof queryFn, typeof deps ];
};

const getSetter = <T>(
  molecule: Molecule<T>,
  args: any[],
) => {
  let setter: (value: T) => MaybePromise<any>;

  const callback = (fn: (value: T) => MaybePromise<any>) => {
    setter = fn;
    return () => void 0;
  };
  callback.get = (atom: Atom<any> | Molecule<any>, atomDeps: any[] = []) => {
    const [ value ] = getInternalAtom(atom).getState(atomDeps);
    return value;
  };
  callback.set = (atom: Atom<any> | Molecule<any>, atomDeps: any[] = []) => {
    const [ , setValue ] = getInternalAtom(atom).getState(atomDeps);
    return setValue;
  };

  const result = molecule.set(callback, args);
  if (setter == null) {
    if (typeof result === 'function') {
      setter = result;
    } else {
      throw new Error('You must specify a setter either by returning a function or providing one to callback');
    }
  }

  return [ setter ] as [ typeof setter ];
};

function getState<T, D extends any[]>(this: Molecule<T, D>, args: D): [ T, (value: T) => void  ] {
  // eslint-disable-next-line no-invalid-this
  const molecule = this;
  const [ getter, deps ] = getGetter(molecule, args);
  const [ setter ] = getSetter(molecule, args);

  const query = useQuery(molecule, getter, deps);
  const state = query.data;

  const setState = async (value: T) => {
    const valueOrPromise = setter(value);

    if (isPromise(valueOrPromise)) {
      await valueOrPromise;
    } else {
      await Promise.resolve();
    }

    query.invalidate();
  };

  return [ state, setState ];
}

export default function molecule<T, D extends any[] = any[]>(config: Partial<Molecule<T, D>>): Molecule<T, D> {
  const molecule = {
    get: config.get || (() => void 0),
    set: config.set || (() => () => {}),
  };
  Object.defineProperty(molecule, '$$molecule', { value: true });
  Object.defineProperty(molecule, 'getState', { value: getState });
  return molecule;
}