import {
  QueryState,
  Status,
} from '@respite/core';
import { MutableRefObject } from 'react';

export default function syncQueryState<T>(
  query: QueryState<T>,
  ref: MutableRefObject<QueryState<T>>,
  rerender: () => void,
) {
  // this is where we determine when/what to update the local state with
  switch (query.status) {
  case Status.LOADING:
    switch (ref.current.status) {
    // if the query is loading and we don't have some data already
    // mirror the query entirely
    case Status.IDLE:
      ref.current = { ...query };
      break;
    // we're already re-fetching so we don't need to do anything
    case Status.LOADING:
    case Status.FETCHING:
      break;
    case Status.ERROR:
      ref.current = { ...query };
      break;
    // for anything else, we're in a non-fetching state and we need to transition to a fetching state
    default:
      ref.current = {
        ...ref.current,
        status: Status.FETCHING,
        promise: query.promise,
      };
      break;
    }
    break;
  // completely replace the state
  case Status.SUCCESS:
  case Status.ERROR:
    ref.current = { ...query };
    break;
  }
  rerender();
}
