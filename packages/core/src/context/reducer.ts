import { Reducer, useReducer } from 'react';
import { ActionType, Status } from '../constants';
import { getQueryByDeps } from '../utils';
import type { Deps, Key } from '../types';

export interface QueryState<T> {
  deps: Deps,
  status: Status,
  data: T,
  error: any,
}

export type State<T> = QueryState<T>[];


interface ActionInvalidate {
  type: ActionType.INVALIDATE,
  key?: Key,
  deps?: Deps,
  exact?: boolean,
  predicate?: <T>(query: QueryState<T>) => boolean,
}
interface ActionFetching {
  type: ActionType.FETCHING,
  deps: Deps,
}
interface ActionSuccess<T> {
  type: ActionType.SUCCESS,
  deps: Deps,
  data: T,
}
interface ActionFailure {
  type: ActionType.FAILURE,
  deps: Deps,
  error: any,
}
// eslint-disable-next-line max-len
export type Action<T> = ActionInvalidate | ActionFetching | ActionSuccess<T> | ActionFailure;

export const updateQuery = <T>(state: State<T>, deps: Deps, props: Partial<QueryState<T>>) => {
  const [ query, i ] = getQueryByDeps(state, deps);

  if (query == null) {
    return [
      ...state,
      {
        status: Status.IDLE,
        deps,
        ...props,
      },
    ];
  }

  const newState = state.slice();
  newState[i] = {
    ...query,
    ...props,
  };

  return newState;
};

export const fetching = <T>(state: State<T>, action: ActionFetching) => {
  return updateQuery(state, action.deps, { status: Status.LOADING });
};

export const success = <T>(state: State<T>, action: ActionSuccess<T>) => {
  return updateQuery(state, action.deps, {
    status: Status.SUCCESS,
    data: action.data,
    error: void 0,
  });
};

export const failure = <T>(state: State<T>, action: ActionFailure) => {
  return updateQuery(state, action.deps, {
    status: Status.ERROR,
    data: void 0,
    error: action.error,
  });
};

export const invalidate = <T>(state: State<T>, action: ActionInvalidate) => {
  let {
    deps,
    exact,
  } = action;

  // internally the key is already part of deps
  // but from an external consumer you'd expect the key to be a separate entity
  // so if we receive an explicit key, we should prepend it to the deps
  if (Object.prototype.hasOwnProperty.call(action, 'key')) {
    deps = [ action.key, ...(deps || []) ];
  }

  const predicate = (() => {
    if (action.predicate) {
      return action.predicate;
    }
    if (exact) {
      return (query: QueryState<T>) => {
        if (deps.length !== query.deps.length) {
          return false;
        }
        return deps.every((dep, i) => dep === query.deps[i]);
      };
    }
    return (query: QueryState<T>) => {
      return query.deps[0] === deps[0];
    };
  })();

  return state.filter(query => !predicate(query));
};

const reducer = (state: State<any>, action: Action<any>) => {
  switch (action.type) {
  case ActionType.FETCHING:
    return fetching(state, action);
  case ActionType.SUCCESS:
    return success(state, action);
  case ActionType.FAILURE:
    return failure(state, action);
  case ActionType.INVALIDATE:
    return invalidate(state, action);
  default:
    return state;
  }
};

export default () => useReducer<Reducer<State<any>, Action<any>>>(reducer as any, []);
