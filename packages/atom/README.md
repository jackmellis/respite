# `@respite/atom`

An atom-based state library.

This will just cover getting started and the api, for an overarching explanation of respite, see the [repo readme](https://github.com/jackmellis/respite/blob/main/README.md)

## Getting started

```
npm install @respite/core @respite/query @respite/atom
```

## Usage

```tsx
import React from "react";
import { Provider, useAtom, atom, molecule } from "@respite/atom";

const USER_ID = atom({ default: 1 });

const USER = molecule({
  get({ get }) {
    const id = get(USER_ID);
    return () => fetch(`/api/user/${id}`);
  },
  set({ get }) {
    const id = get(USER_ID);
    return (values) => patch(`/api/user/${id}`, values);
  },
});

function MyComponent() {
  const [user, setUser] = useAtom(USER);

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

## atom

```ts
<T>({ default?: T }): Atom<T>
```

This is the smallest "unit of state". You define the atom globally and then that state is available in any component by passing it into `useState` or `useValue`.

- **default**
  The default value of the atom. If not provided it defaults to `undefined`.

## molecule

```ts
<T, D extends any[]>({
  get(callback: (fn: () => T | Promise<T>, deps?: any[]), args: D): T | Promise<T> | () => T | Promise<T>,
  get({ get: <U>(atom: Atom<U>, deps?: any[]) => U }, args: D): T | Promise<T> | () => T | Promise<T>,
  set(callback: (fn: () => T | Promise<T>, deps?: any[]), args: D): (value: T) => any,
  set({ get: <U>(atom: Atom<U>, deps?: any[]) => U, set: <U>(atom: Atom<U>, deps?: any[]) => (value: U) => void }, args: D): (value: T) => any,
}): Molecule<T, D>;
```

Okay this signature looks pretty complex so lets break it down by example.

A molecule can have a getter and/or a setter.

### get

Here's a very basic getter:

```ts
const m = molecule({
  get() {
    return "foo";
  },
});
```

calling `useState(m)` will return `'foo'`

If you want to access other atoms/molecules you can do so using the `get` helper:

```ts
const m = molecule({
  get({ get }) {
    const foo = get(FOO_ATOM);
    return foo;
  },
});
```

The getter is called at "react level" which means you can safely call any other react hooks. However, in order for the molecule to understand when it needs to recalculate, you need to subscribe your dependencies (just like if you were calling `useEffect` or `useMemo`):

```ts
const m = molecule({
  get(memo) {
    const [foo] = useState(FOO_ATOM);
    const thing = useThing();

    return memo(() => {
      return foo + thing;
    }, [foo, thing]);
  },
});
```

So now when the getter is called, we're telling react that whenever `foo` or `thing` changes, the molecule must also be recomputed.

Hopefully these 3 types of getter make sense. You've essentially got **basic** getters, **atom-based** getters and **hook-based getters**

### set

Set is very similar to get:

```ts
const m = molecule({
  set() {
    return (value) => {
      // save the value
    };
  },
});
```

```ts
const m = molecule({
  set({ set }) {
    const setFoo = set(FOO_ATOM);

    return (value) => {
      setFoo(value);
    };
  },
});
```

```ts
const m = molecule({
  set(memo) {
    const [foo, setFoo] = useState(FOO_ATOM);
    const thing = useThing();

    return memo(
      (value) => {
        setFoo(value + thing);
      },
      [foo, thing]
    );
  },
});
```

> it's also worth noting that both the getter and setter functions can return promises

### args

The final piece of the molecule puzzle is args. A molecule can optionally rely on external dependencies passed in from the component level. This is similar to recoil's atomFamily concept:

```ts
const m = molecule<string, [number]>({
  get({ get }, [index]) {
    const list = get(LIST_ATOM);
    return list[index];
  },
});
```

You would then call it with

```ts
useState(m, [1]);
```

It's important to note that a specific set of args will result in a specific instance of the molecule. For example:

```ts
const [first] = useState(m, [1]);
const [second] = useState(m, [2]);
```

## useState / useAtom

```ts
<T>(atom: Atom<T>, deps?: any[]): [ T, (value: T) => void ]
<T>(molecule: Molecule<T>, deps?: any[]): [ T, (value: T) => void ]
```

## useValue

```ts
<T>(atom: Atom<T>, deps?: any[]): T
```

## useReset

```ts
(atom: Atom): () => void
```

Returns a reset function that reverts the atom to its initial state

## Provider

```ts
ComponentType<{
  cacheTime?: number,
}>
```

The provider component is required to handle the caching of state between components, you should place it near the top of your application.

```tsx
const App = () => (
  <Provider>
    <Page />
  </Provider>
);
```
