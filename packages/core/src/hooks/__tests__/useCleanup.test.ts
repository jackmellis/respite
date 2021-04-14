import { renderHook } from '@testing-library/react-hooks';
import { Status } from '../../constants';
import useCleanup from '../useCleanup';

it('invalidates all stale queries', async() => {
  const context = {
    pubSub: null,
    dispatch: jest.fn(),
    queries: [
      {
        deps: [ 1 ] as [ 1 ],
        promise: null,
        subscribers: 0,
        created: new Date('2021-01-01'),
        data: null,
        error: null,
        status: Status.SUCCESS,
      },
      {
        deps: [ 2 ] as [ 2 ],
        promise: null,
        subscribers: 1,
        created: new Date('2021-01-01'),
        data: null,
        error: null,
        status: Status.SUCCESS,
      },
      {
        deps: [ 3 ] as [ 3 ],
        promise: null,
        subscribers: 0,
        created: new Date('2021-01-01'),
        data: null,
        error: null,
        status: Status.SUCCESS,
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

  expect(context.queries).toHaveLength(1);
});

it('removes stale subscribers from the list', async() => {
  const context = {
    dispatch: jest.fn(),
    pubSub: null,
    queries: [
      {
        deps: [ 1 ] as [ 1 ],
        promise: null,
        subscribers: 0,
        created: new Date('2021-01-01'),
        data: null,
        error: null,
        status: Status.SUCCESS,
      },
      {
        deps: [ 2 ] as [ 2 ],
        promise: null,
        subscribers: 1,
        created: new Date('2021-01-01'),
        data: null,
        error: null,
        status: Status.SUCCESS,
      },
      {
        deps: [ 3 ] as [ 3 ],
        promise: null,
        subscribers: 1,
        created: new Date('2021-01-01'),
        data: null,
        error: null,
        status: Status.SUCCESS,
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

  renderHook(() => useCleanup(context, 0, 50));

  await new Promise(res => setTimeout(res, 75));

  expect(context.queries).toHaveLength(2);
});

it('when cache time is Infinity it does nothing', async() => {
  const context = {
    pubSub: null,
    dispatch: jest.fn(),
    queries: [
      {
        deps: [ 1 ] as [ 1 ],
        promise: null,
        subscribers: 0,
        created: new Date(),
        data: null,
        error: null,
        status: Status.SUCCESS,
      },
      {
        deps: [ 2 ] as [ 2 ],
        promise: null,
        subscribers: 1,
        created: new Date(),
        data: null,
        error: null,
        status: Status.SUCCESS,
      },
      {
        deps: [ 3 ] as [ 3 ],
        promise: null,
        subscribers: 1,
        created: new Date(),
        data: null,
        error: null,
        status: Status.SUCCESS,
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
