import {
  useReducer as useReactReducer,
  Reducer,
} from 'react';
import {
  Status,
  ActionType,
} from '@respite/core';

interface State<T>{
  status: Status,
  data: T,
  error: any,
}

export interface Action<T> {
  type: ActionType,
  data?: T,
  error?: any,
}

const initialState: State<any> = {
  status: Status.IDLE,
  data: null,
  error: null,
};

const reducer = <T>(state: State<T>, action: Action<T>) => {
  switch (action.type) {
  case ActionType.INVALIDATE:
    return {
      status: Status.IDLE,
      data: null,
      error: null,
    };
  case ActionType.FETCHING:
    return {
      status: Status.LOADING,
      data: state.data,
      error: state.error,
    };
  case ActionType.SUCCESS:
    return {
      status: Status.SUCCESS,
      data: action.data,
      error: null,
    };
  case ActionType.FAILURE:
    return {
      status: Status.ERROR,
      data: null,
      error: action.error,
    };
  }
};

export default function useReducer<T>() {
  return useReactReducer<Reducer<State<T>, Action<T>>>(reducer, initialState);
}