import {
  ActionType,
  Status,
  useCache,
  Cache,
} from '@respite/core';
import useReducer from './useReducer';
import wrapCallback from './wrapCallback';

type AnyFunction<T> = (...args: any[]) => Promise<T>;

interface ActionQuery<T, F extends AnyFunction<T>> {
  action: F,
  status: Status,
  data: T,
  error: any,
  submitting: boolean,
  invalidate: Cache['invalidate'],
  reset: () => void,
}

export default function useAction<T, F extends AnyFunction<T>>(
  callback: F,
): ActionQuery<T, F> {
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
