import { renderHook } from '@testing-library/react-hooks';
import useCleanup from '../useCleanup';

it('invalidates all stale queries', async() => {
  const context = {
    state: [],
    dispatch: jest.fn(),
    subscribers: [
      {
        deps: [ 1 ] as [ 1 ],
        promise: null,
        subscribers: 0,
        created: new Date(),
      },
      {
        deps: [ 2 ] as [ 2 ],
        promise: null,
        subscribers: 1,
        created: new Date(),
      },
      {
        deps: [ 3 ] as [ 3 ],
        promise: null,
        subscribers: 1,
        created: new Date(),
        ttl: 0,
      },
    ],
    config: {
      queries: {
        eager: false,
        prefetch: false,
        retry: () => false,
        suspendOnRefetch: false,
      },
    },
  };

  renderHook(() => useCleanup(context, 0, 0));

  await new Promise(res => setTimeout(res, 5));

  expect(context.dispatch).toHaveBeenCalled();
  const predicate = context.dispatch.mock.calls[0][0].predicate;

  expect(predicate({ deps: [ 1 ] })).toBe(true);
  expect(predicate({ deps: [ 2 ] })).toBe(false);
  expect(predicate({ deps: [ 3 ] })).toBe(true);
});

it('removes stale subscribers from the list', async() => {
  const context = {
    state: [],
    dispatch: jest.fn(),
    subscribers: [
      {
        deps: [ 1 ] as [ 1 ],
        promise: null,
        subscribers: 0,
        created: new Date(),
      },
      {
        deps: [ 2 ] as [ 2 ],
        promise: null,
        subscribers: 1,
        created: new Date(),
      },
      {
        deps: [ 3 ] as [ 3 ],
        promise: null,
        subscribers: 1,
        created: new Date(),
        ttl: 0,
      },
    ],
    config: {
      queries: {
        eager: false,
        prefetch: false,
        retry: () => false,
        suspendOnRefetch: false,
      },
    },
  };

  renderHook(() => useCleanup(context, 0, 0));

  await new Promise(res => setTimeout(res, 5));

  expect(context.subscribers).toHaveLength(1);
});

it('when cache time is Infinity it does nothing', async() => {
  const context = {
    state: [],
    dispatch: jest.fn(),
    subscribers: [
      {
        deps: [ 1 ] as [ 1 ],
        promise: null,
        subscribers: 0,
        created: new Date(),
      },
      {
        deps: [ 2 ] as [ 2 ],
        promise: null,
        subscribers: 1,
        created: new Date(),
      },
      {
        deps: [ 3 ] as [ 3 ],
        promise: null,
        subscribers: 1,
        created: new Date(),
        ttl: 1000,
      },
    ],
    config: {
      queries: {
        eager: false,
        prefetch: false,
        retry: () => false,
        suspendOnRefetch: false,
      },
    },
  };

  renderHook(() => useCleanup(context, Infinity, 0));

  await new Promise(res => setTimeout(res, 5));

  expect(context.dispatch).not.toHaveBeenCalled();
});
