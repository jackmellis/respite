# `@respite/query`

A query-based library to make state management just easy.

This will just cover getting started and the api, for an overarching explanation of respite, see the [repo readme](https://github.com/jackmellis/respite/blob/main/README.md)

## Getting started

```
npm install @respite/core @respite/query
```

## Usage

```tsx
import React, { Suspense } from "react";
import { Provider, useQuery } from "@respite/query";

function MyComponent() {
  const { data: user } = useQuery("user", () => fetch("/api/my/user"));

  return <div>{user.name}</div>;
}

function App() {
  return (
    <Provider>
      <Suspense fallback={<div>loading</div>}>
        <MyComponent />
      </Suspense>
    </Provider>
  );
}
```

## useQuery

```ts
<T>(
  key: any,
  fetch?: () => Promise<T> | T,
  deps?: any[],
  options?: {
    eager?: boolean,
    prefetch?: boolean,
    ttl?: number,
    suspendOnRefetch?: boolean,
    retry?: (error: any, tries: number) => boolean | Promise<any>,
  },
): Query<T>
```

Creates a query. The query is lazily created, meaning it won't call `fetch` until you access `query.data`. Ths means you can pass the entire query around your application without immediately trigerring fetches or suspenses.

- **key**  
  This should be a unique identifier for the query. Any other calls to `useQuery` with the same key will share the same cache pool. Typically the key will be a string but you could use a Symbol or even an object reference.

- **fetch**  
  A function that returns or resolves some value. If it returns a promise then the query will trigger a react suspense on the component that reads it. If it returns a non-promise then it will just resolve immediately. If you omit the fetch argument entirely, the query will immediately resolve with `undefined`

- **deps**  
  Any dependencies that your fetch function relies on. If any of the dependencies change, the query will re-fetch (but won't suspend).

- **options**  
  Additional configuration options
  - **_eager_**  
    Forces the query to fetch data immediately and suspend the component
  - **prefetch**  
    Causes the query to fetch data immediately _in the background_
  - **_ttl_**  
    This is the **time to live** in ms. If set then the query will be invalidated and re-fetched. The default behaviour is to cache a query forever as long as it's being used.
  - **_suspendOnRefetch_**  
    When a query re-fetches, the default behaviour is to continue to show the previous data until the new data is available. If you set `suspendOnRefetch` to `true`, the query will suspend whenever it refetches.
  - **_retry_**  
    If the query fails to resolve, this function will determine whether to try again. The function takes the error and the number of consecutive times the query has failed to fetch. You can return a promise if you want to add a delay before retrying

Example with all arguments:

```ts
const query = useQuery("key", () => fetch(`/api/user/${id}`), [id], {
  eager: false,
  prefetch: true,
  // refetch after 60 seconds
  ttl: 60000,
  // retry only if we have a 500 response, and only retry 3 times
  retry: (e, tries) => e.statusCode === 500 && tries < 3,
});
```

## useQueryCallback

```ts
<T>(
  key: any,
  fetch: (deps: any[]) => Promise<T> | T,
  options?: {
    ttl?: number
  }
): (deps: any[]) => Promise<Query<T>>
```

Sometimes you don't know a query's keys until later on, such as inside a callback function, so you can't use the `useQuery` hook directly.

The `useCallbackQuery` hook lets you create a function that will take the dependencies at a later point and return an asynchronous query.

For example:

```ts
const fetchQuery = useQueryCallback(key, ([name]) => fetchData(name));

const onSubmit = async (values) => {
  const { data } = await fetchQuery([values.name]);
};
```

useQueryCallback will synchronise with useQuery. So if you've already fetched the data with one method, it will be immediately resolved for the other method.

## Provider

```ts
ComponentType<{
  cacheTime?: number,
  queries?: QueryOptions
}>
```

The provider component is required to handle the caching of queries between components, you should place it near the top of your application.

```tsx
const App = () => (
  <Provider>
    <Page />
  </Provider>
);
```

- cacheTime  
  How often to clean up stale queries from the cache. Defaults to 3 minutes
- queries  
  Default configuration options for all queries

## Query

```ts
<T>{
  status: Status,
  data: T,
  reset(): void,
  invalidate(): void,
  resolve(): Promise<T>
}
```

The query shape returned by `useQuery`. It contains the following properties:

- status  
  The current status of the query
- data  
  The data returned by the fetch function. This property is incredibly important. As soon as you access data it will begin fetching the query data.  
  Data is also writable. If you set `query.data = someValue` it will immediately set the query to resolved and share the data value with the rest of the app. This means you _could_ use a query to store any global state without a fetch function.
- reset  
  completely resets a query into its initial idle state
  invalidate  
  invalidates the current query and re-fetches its data
- resolve  
  this gives you a "safe" way to access the data outside of a top-level render function. It returns a promise that will resolve with the value of the query. If the query is already fetched and cached, it will resolve immediately, otherwise it will begin fetching the query and resolve with the value once it is ready.

## Status

This is an enum of states a query can be in, i.e. `SUCCESS` `ERROR` `IDLE` `LOADING`
