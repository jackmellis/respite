import {
  ActionType,
  Status,
  useCache,
  Cache,
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

export default function useAction<F extends AnyFunction<any>>(
  callback: F,
): ActionQuery<F> {
  type T = PromiseType<ReturnType<F>>;
  const { invalidate } = useCache();
  const [ state, dispatch ] = useReducer<T>();
  const {
    data,
    error,
    status,
  } = state;

  const reset = () => dispatch({ type: ActionType.INVALIDATE });
  const submitting = status === Status.LOADING;

  const action = wrapCallback(dispatch, callback);

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
