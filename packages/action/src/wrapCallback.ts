import {
  Dispatch, useCallback,
} from 'react';
import {
  ActionType,
} from '@respite/core';
import { Action } from './useReducer';

export default function wrapCallback<T, F extends (...args: any[]) => Promise<T>>(
  dispatch: Dispatch<Action<T>>,
  callback: F,
): F {
  const f = (async(...args: Parameters<F>) => {
    let result: T;
    let error: any;
    let errored = false;

    dispatch({ type: ActionType.FETCHING });
    try {
      result = await callback(...args);
      dispatch({
        type: ActionType.SUCCESS,
        data: result,
      });
    } catch (e) {
      errored = true;
      error = e;
      dispatch({
        type: ActionType.FAILURE,
        error: e,
      });
    }

    if (errored) {
      throw error;
    }

    return result;
  }) as F;
  return useCallback(f, [ callback, dispatch ]);
}