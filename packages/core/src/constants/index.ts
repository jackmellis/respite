export enum Status {
  IDLE = 'idle',
  LOADING = 'loading',
  FETCHING = 'refetching',
  SUCCESS = 'success',
  ERROR = 'error',
}

export enum ActionType {
  INVALIDATE = 'INVALIDATE',
  FETCHING = 'FETCHING',
  SUCCESS = 'SUCCESS',
  FAILURE = 'FAILURE',
}

export enum PubSubEvent {
  ACTION_FULFILLED = 'action fulfilled',
  INVALIDATE_QUERY = 'invalidate query',
}