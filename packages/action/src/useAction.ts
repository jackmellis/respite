import {
  ActionType,
  Status,
  useCache,
  Cache,
  Key,
  Deps,
  usePubSub,
} from '@respite/core';
import useReducer from './useReducer';
import wrapCallback from './wrapCallback';

type AnyFunction<T> = (...args: any[]) => Promise<T>;
type PromiseType<T> = T extends Promise<infer U> ? U : T;

export interface ActionQuery<F extends AnyFunction<any>> {
  action: F,
  status: Status,
  data: PromiseType<ReturnType<F>>,
  error: any,
  submitting: boolean,
  invalidate: Cache['invalidate'],
  reset: () => void,
}

function useAction<F extends AnyFunction<any>>(callback: F, deps?: Deps): ActionQuery<F>
function useAction<F extends AnyFunction<any>>(key: Key, callback: F, deps?: Deps): ActionQuery<F>
function useAction<F extends AnyFunction<any>>(
  key: Key,
  callback: F,
  deps?: any[]
): ActionQuery<F> {
  if (typeof key === 'function') {
    // @ts-ignore
    deps = callback;
    callback = key;
    key = undefined;
  }
  type T = PromiseType<ReturnType<F>>;
  const { invalidate } = useCache();
  const pubSub = usePubSub();
  const [ state, dispatch ] = useReducer<T>();
  const {
    data,
    error,
    status,
  } = state;

  const reset = () => dispatch({ type: ActionType.INVALIDATE });
  const submitting = status === Status.LOADING;

  const action = wrapCallback(key, dispatch, callback, pubSub, deps);

  return {
    action,
    status,
    data,
    error,
    submitting,
    reset,
    invalidate,
  };
}

export default useAction;