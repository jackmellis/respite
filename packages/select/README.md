# `@respite/select`

A simple selector hook for queries and atoms

This will just cover getting started and the api, for an overarching explanation of respite, see the [repo readme](https://github.com/jackmellis/respite/blob/main/README.md)

## Getting started

```
npm install @respite/core @respite/select
```

## Usage

```ts
const derivedQuery = useSelector(query, (state) => state.someProperty);
const derivedAtom = useSelector(myAtom, (state) => state.someProperty);
```

## useSelector

```ts
<T, R>(query: Query<T>, selector(t: T) => R, deps?: any[]): Query<R>
<T, R>(atom: Atom<T>, selector(t: T) => R,deps?: any[]): R;
```

For queries it returns a derived query using the selector function. The derived query is also lazy.

For atoms, the selector just immediately returns the derived value. In theory there isn't much difference between writing a selector or using a molecule to derive state from another atom. But often in practice a selector is much quicker to quickly set up for a one-off use.

## useSelectAll

```ts
<T, R>(queries: Array<Query<T>>, selector(...t: T[]) => R, deps?: any[]): Query<R>
<T, R>(atoms: Array<Atom<T>>, selector(...t: T[]) => R,deps?: any[]): R;
```

Similar to `useSelector` but accepts an array of queries/atoms.

> Only an array of atoms or an array of molecules is accounted for. Mixing atoms and molecules is not supported currently
