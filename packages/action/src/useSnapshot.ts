import { Query } from '@respite/core';

export default function useSnapshot<T>(query: Query<T>) {
  return (value: T | ((t: T) => T)) => {
    const previous = query.data;
    if (typeof value === 'function') {
      // @ts-ignore
      value = value(previous);
    }
    // @ts-ignore
    query.data = value;

    return () => {
      // TODO: what happens if the query was in an idle/loading/error state?
      // this method would then set the query to success + undefined
      query.data = previous;
    };
  };
}