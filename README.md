# respite

Yet another state management solution

The purpose of these packages is to try to streamline the state management solution that currently exists. Right now there are a lot of them. I've tried to pick and choose the features that suit my style of application development.

Essentially there are 2 types of state management:

- fetching / synchronization (fetching data from an api)
- global state not directly tied to external data (sharing a list of todos between multiple components)

The repo is made up of the following packages:

## [@respite/core](./packages/core/README.md)

This is the internal package that all other respite packages are based off. You shouldn't need to use it directly.

## [@respite/query](./packages/query/README.md)

A query-based package in a similar vein to react-query. The main feature of this (and one of the biggest draw to react query) is its ability to automatically refresh your data based on other events.

Main differences to react-query:

- Laziness

I love the suspense api for data loading. react-query supports it but not by default. @respite/query _always_ uses suspense for fetching new queries.

The big difference, however, is that it won't actually load any data or suspend the component until you attempt to read it. This means you can create a query, then pass it to child components, or only use it conditionally.

This solves a big issue when splitting components into smart/dumb responsibilities:

with react query:

```tsx
const DumbComponent = (query) => <div>query.data</div>;

const SmartComponent = () => (
  <DumbComponent query={useQuery(key, fetch, { suspense: true })} />
);

const SomeOuterComponent = () => (
  <Suspense fallback={<Loading />}>
    <ErrorBoundary>
      <SmartComponent />
    </ErrorBoundary>
  </Suspense>
);
```

with respite:

```tsx
const DumbComponent = (query) => <div>query.data</div>;

const SmartComponent = () => (
  <Suspense fallback={<Loading />}>
    <ErrorBoundary>
      <DumbComponent query={useQuery(key, fetch)} />
    </ErrorBoundary>
  </Suspense>
);
```

It also completely negates the need for an `enabled` configuration, a query is considered idle until you access `.data`.

- Simplicity

This is a driving consideration in general for me and I must give kudos to react-query for its simple api.

In my experience, however, I found that I used only a fraction of its built-in functionality. I decided to focus on the core requirements and avoid bloat as much as possible. Leading onto the next point...

- Size

`@respite/core` comes in at 5.5kB and `@respite/query` is 3.3kB. That's 8.8kB for the entire thing. Even if you include the totally optional `@respite/select` and `@respite/action` packages, that's still only 12.5kB!

At the time of writing some other state management libraries:

|                       |         |
| --------------------- | ------: |
| @respite/query + core |   8.8kB |
| react-redux + redux   |  21.8kB |
| react-query           |  45.8kB |
| recoil                |    48kB |
| relay                 | 140.7kB |
| mobx                  |  53.5kB |
| @apollo/client        | 126.6kB |

You get the idea

- React-centric

react-query has gone to some lengths to make the core state management framework-agnostic. Personally, with a library that is literally named after a framework, I don't see why we shouldn't just leverage the framework as much as possible

- Unintrusive defaults

> Out of the box, React Query is configured with aggressive but sane defaults

immediately-stale queries, refetching on window focus, automatic exponential retries, these are certainly some aggressive defaults!

Respite takes a more chilled approach to defaults: active queries _never_ go stale by default, automatically retrying must be opted-in, there is no externally-triggered refetching out of the box

## [@respite/atom](./packages/atom/README.md)

Inspired by recoil. I found the usual patterns for recoil very quickly result in confusing setups. Maybe that's just me. I also felt like `selector` is a very confusing term when you're creating an object that's readable and writable. In reality their `selector` is actually just an atom made up of one or more other atoms... surely that's a molecule?

I also wasn't keen on there being no way to manage side effects. Selectors are meant to be idempotent, but there is no other way to fetch data than inside a selector.

My main thought process for atom was to provide an atom-like api but at the same time, provide a react context in which to carry out your side effects.

recoil:

```ts
const myQuery = selector({
  key: "MyDBQuery",
  get: async () => {
    // how does this equate to function purity?
    // how would you unit test this??
    const response = await fetch(getMyRequestUrl());
    return response.json();
  },
});
```

@respite/atom:

```ts
const myQuery = molecule({
  get: () => {
    const fetch = useSomeInjectableFetchHook();
    return async () => {
      const response = await fetch(getMyRequestUrl());
      return response.json();
    };
  },
});
```

There's also quite a lot going on to ensure that your atoms/molecules are correctly invalidated if/when their dependencies change

## [@respite/select](./packages/select/README.md)

I always wished for a way to create a new query from an existing one. Admitedly react-query added something similar to this fairly recently, but it still doesn't quite fit what I had in mind. @respite/select allows something like this:

```ts
const allTheThingsQuery = useQuery(key, fetch);
const thingAQuery = useSelector(allTheThingsQuery, (things) => things.thingA);
const thingBQuery = useSelector(allTheThingsQuery, (things) => things.thingB);

const { data } = thingAQuery;
```

I often have an api that provides me with a whole load of data that I then have to split out. I would much prefer to abstract that knowledge away so that my components just think there is a `thingA` and `thingB` query rather than a single `allTheThings` query.

## [@respite/action](./packages/action/README.md)

This is a tiny utility library that does a simlar job to react-query's `useMutation` hook. Essentially it wraps a mutator function and provides some metadata about it such as status, error, data, submitting. It's not directly related to queries or atoms so it can be used entirly on its own.
