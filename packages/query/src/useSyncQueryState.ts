import {
  QueryState,
  Status,
} from '@respite/core';
import { useEffect } from 'react';

export default function useSyncQueryState<T>(
  query: QueryState<T>,
  state: QueryState<T>,
  setState: (query: QueryState<T>) => void,
) {
  useEffect(() => {
    // this is where we determine when/what to update the local state with
    switch (query.status) {
    case Status.LOADING:
      switch (state.status) {
      // if the query is loading and we don't have some data already
      // mirror the query entirely
      case Status.IDLE:
        setState(query);
        break;
      // we're already re-fetching so we don't need to do anything
      case Status.LOADING:
      case Status.FETCHING:
        break;
      case Status.ERROR:
        setState(query);
        break;
      // for anything else, we're in a non-fetching state and we need to transition to a fetching state
      default:
        setState({
          ...state,
          status: Status.FETCHING,
        });
        break;
      }
      break;
    // completely replace the state
    case Status.SUCCESS:
    case Status.ERROR:
      setState(query);
      break;
    }
  }, [ query.status, state.status, query.data, query.error ]);
}
