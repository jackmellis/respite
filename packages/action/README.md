# `@respite/action`

A small wrapper around any actioning function that adds some useful metadata.

This will just cover getting started and the api, for an overarching explanation of respite, see the [repo readme](https://github.com/jackmellis/respite/blob/main/README.md)

## Getting started

```
npm install @respite/core @respite/action
```

## Usage

```tsx
const {
  action: onSubmit,
  error,
  submitting,
} = useAction(values => post('/api/save', values));

return (
  <button onClick={() => onSubmit(values)} disabled={submitting}>
    Submit
  </div>
);
```

## useAction

```ts
(callback: Function): {
  action: Function,
  status: Status,
  data: any,
  error: any,
  submitting: boolean,
  reset: () => void,
  invalidate: ({
    key?: any,
    deps?: any[],
    exact?: boolean,
    predicate?: (query: Query) => boolean,
  }) => void,
}
```

The most common use case is to pair this with `@respite/query` to invalidate a query upon success:

```ts
useAction(async (values) => {
  await post("/api/save", values);

  query.invalidate();
});
```

If you don't have the query to hand or you have multiple queries, `useAction` returns a helpful `invalidate` method:

```ts
const { invalidate } = useAction(async (values) => {
  await post("/api/save", values);

  invalidate({ key: "my-query-key" });
});
```

- action
- status
- data
- error
- submitting
- reset
  Resets `status`, `data`, `error`, and `submitting` to their original values
- invalidate
  Allows you to invalidate queries during the action

## useSnapshot

```ts
<T>(query: Query<T>): (value: T | (prev: T) => T) => () => void;
```

Allows you to take a snapshot of a query, update its value, then roll back if required. This is mainly useful for doing optimistic updates during an action:

```ts
const setData = useSnapshot(query);

return useAction(async (values) => {
  const rollback = setData((prev) => ({ ...prev, ...values }));

  try {
    await post("/api/save", values);
  } catch {
    rollback();
  }
});
```
