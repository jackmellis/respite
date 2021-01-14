import {
  useRef,
  useEffect,
  Dispatch,
} from 'react';
import {
  ActionType,
} from '@respite/core';
import { Action } from './useReducer';

export default function wrapCallback<T, F extends (...args: any[]) => Promise<T>>(
  dispatch: Dispatch<Action<T>>,
  callback: F,
): F {
  const mountedRef = useRef(true);
  // @ts-ignore
  const onlyWhenMounted = <F extends (...args: any[]) => any>(fn: F): ReturnType<F> => {
    if (mountedRef.current) {
      return fn();
    }
  };

  useEffect(() => () => {
    mountedRef.current = false;
  }, []);

  return (async(...args: Parameters<F>) => {
    let result: T;
    let error: any;
    let errored = false;

    onlyWhenMounted(() => dispatch({ type: ActionType.FETCHING }));
    try {
      result = await callback(...args);
      onlyWhenMounted(() => dispatch({
        type: ActionType.SUCCESS,
        data: result,
      }));
    } catch (e) {
      errored = true;
      error = e;
      onlyWhenMounted(() => dispatch({
        type: ActionType.FAILURE,
        error: e,
      }));
    }

    if (errored) {
      throw error;
    }

    return result;
  }) as F;
}