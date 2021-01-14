import {
  Cache,
  CallbackType,
  Deps,
  isPromise,
  SyncPromise,
} from '@respite/core';

export default function makeFetch<T>(
  cache: Cache,
  deps: Deps,
  callback: CallbackType<T>,
  retry: (error: any, tries: number) => (boolean | Promise<any>),
) {
  const fetch = (tries = 1) => {  
    // if there's already a promise then we're in the middle of fetching the data
    // potentially from an identical query from another component
    const existingPromise = cache.getPromise<T>(deps);
    if (existingPromise) {
      return existingPromise;
    }

    try {
      const dataOrPromise = callback?.();

      if (isPromise(dataOrPromise)) {
        const p = Promise.resolve().then(async(): Promise<any> => {
          cache.fetching(deps);
      
          try {
            const data = await dataOrPromise;
            cache.success(deps, data);
          } catch (e) {
            const shouldRetry = retry?.(e, tries);
            if (shouldRetry) {
              await shouldRetry;
              cache.setPromise(deps, null);
              return fetch(tries + 1);
            }
            cache.failure(deps, e);
          }
        });
        cache.setPromise(deps, p);
        return p;
      }
      // even though we've synchronously fetched the data, we can't set it in the state immediately
      // as we're almost definitely going to be inside the render of another component and react does not
      // like updating state mid-render
      Promise.resolve().then(() => {
        cache.success(deps, dataOrPromise);
      });
      // we need to create this dummy SyncPromise because there's a good chance react will re-render
      // before the value has been passed into the above reducer
      // we don't want to suspend the component if we're not actually doing async stuff, so we store the value
      // in a special object and when the next render cycle happens, it knows that this is a special thing
      cache.setPromise(deps, new SyncPromise(dataOrPromise));
      return dataOrPromise;
    } catch (e) {
      const shouldRetry = retry?.(e, tries);
      if (shouldRetry) {
        return fetch(tries + 1);
      }
      Promise.resolve().then(() => {
        cache.failure(deps, e);
      });
      throw e;
    }
  };
  return fetch;
}
