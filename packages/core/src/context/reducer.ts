import { useMemo } from 'react';
import { ActionType, PubSubEvent, Status } from '../constants';
import { getQueryByDeps, PubSub } from '../utils';
import type { Deps, Key } from '../types';
import type {QueryState, State} from './context';


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

export const updateQuery = <T>(state: State<T>, deps: Deps, props: Partial<QueryState<T>>, pubSub: PubSub) => {
  const [ query ] = getQueryByDeps(state, deps);

  if (query == null) {
    state.push({
      status: Status.IDLE,
      deps,
      created: new Date(),
      data: void 0,
      error: void 0,
      promise: null,
      subscribers: 0,
      ...props,
    });
    return;
  }

  Object.assign(query, props);
  pubSub.dispatch(PubSubEvent.INVALIDATE_QUERY, query);
  // query.subscribers.forEach(cb => {
  //   cb(query);
  // });
};

export const fetching = <T>(state: State<T>, action: ActionFetching, pubSub: PubSub) => {
  updateQuery(state, action.deps, { status: Status.LOADING }, pubSub);
};

export const success = <T>(state: State<T>, action: ActionSuccess<T>, pubSub: PubSub) => {
  updateQuery(state, action.deps, {
    status: Status.SUCCESS,
    data: action.data,
    error: void 0,
    created: new Date(),
    promise: null,
  }, pubSub);
};

export const failure = <T>(state: State<T>, action: ActionFailure, pubSub: PubSub) => {
  updateQuery(state, action.deps, {
    status: Status.ERROR,
    data: void 0,
    error: action.error,
    created: new Date(),
    promise: null,
  }, pubSub);
};

export const invalidate = <T>(state: State<T>, action: ActionInvalidate, pubSub: PubSub) => {
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

  state.forEach(query => {
    if (predicate(query)) {
      updateQuery(state, query.deps, {
        status: Status.IDLE,
        data: undefined,
        error: undefined,
        promise: null,
      }, pubSub);
    }
  });
};

const reducer = (state: State<any>, action: Action<any>, pubSub: PubSub) => {
  switch (action.type) {
  case ActionType.FETCHING:
    fetching(state, action, pubSub);
    break;
  case ActionType.SUCCESS:
    success(state, action, pubSub);
    break;
  case ActionType.FAILURE:
    failure(state, action, pubSub);
    break;
  case ActionType.INVALIDATE:
    invalidate(state, action, pubSub);
    break;
  default:
    break;
  }
};

export default (state: State<any>, pubSub: PubSub) => {
  const dispatch = (action: Action<any>) => {
    reducer(state, action, pubSub);
  };

  return useMemo(() => [ state, dispatch ] as const, []);
};
