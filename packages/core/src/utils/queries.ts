import type { QueryState, State, Deps, Key } from '../types';

export const compareDeps = (a: Deps, b: Deps) => {
  if (a.length !== b.length) {
    return false;
  }
  return a.every((dep, i) => dep === b[i]);
};

export const getQuery = <T>(
  state: State<T>,
  predicate: (query: QueryState<T>) => boolean,
) : [ QueryState<T>, number ] => {
  for (let i = 0; i < state.length; i++) {
    if (predicate(state[i])) {
      return [ state[i], i ];
    }
  }
  return [ void 0, -1 ];
};

export const getQueryByKey = <T>(state: State<T>, key: Key) => {
  return getQuery(state, query => query.deps[0] === key);
};

export const getQueryByDeps = <T>(state: State<T>, deps: Deps) => {
  return getQuery(state, query => compareDeps(deps, query.deps));
};