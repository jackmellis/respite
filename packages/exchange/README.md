# `@respite/exchange`

This is a very small library that lets you to link your respite actions and queries in an agnostic location in your code base.

For some context: right now if you have an action that updates your data on the back end, you have to then manually invalidate your queries as part of the action:

```ts
return useAction(async () => {
  const result = await doSomeMutating();

  myQuery.invalidate();

  return result;
})
```
or invalidate a whole collection of queries:
```ts
const action = useAction(async () => {
  const result = await doSomeMutating();

  action.invalidate({ key: 'myQuery' });

  return result;
});

return action;
```

The problem with this is that a) you have to break out of your mutating process to clear your queries, and then return to the mutating again, and b) you're tightly coupling your actions to your queries. Sometimes you don't even know what queries are depending on the data you've just updated!

`@respite/exchange` offers a way for you to declare which queries are invalidated by which actions, separate to the actions themselves.

With exchange, your action would look like this:

```ts
return useAction('my-action', doSomeMutating);
```

and then, separately, you would link your actions and queries like this:
```ts
useExchange([ 'myQuery', 'my-action' ]);
```
Now whenever your action is triggered, the query will be invalidated, but neither action nor query are coupled!

You can pass in multiple actions and multiple queries, it's entirely up to you how you want to organise your exchanges:

```ts
useExchange(
  [ 'myQuery', [ 'update', 'create', 'delete' ] ],
  [ ['authQuery', 'userQuery' ], 'updateUser' ],
  [ [ 'basketQuery', 'voucherQuery' ], [ 'updateBasket', 'applyVoucher' ] ],
);
```