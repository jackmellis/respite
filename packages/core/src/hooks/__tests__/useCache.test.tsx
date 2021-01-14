import React, { ReactNode } from 'react';
import { renderHook } from '@testing-library/react-hooks';
import { Status } from '../../constants';
import context, { Subscriber } from '../../context/context';
import { State } from '../../context/reducer';
import useCache from '../useCache';

const defaultSubscribers = [
  {
    deps: [ 1 ] as [ 1 ],
    promise: Promise.resolve(),
    subscribers: 0,
    created: new Date(),
  },
];
const defaultState = [
  {
    status: Status.IDLE,
    deps: [ 1 ] as [ 1 ],
    data: null,
    error: null,
  },
];

const wrapper = ({
  dispatch = () => {},
  subscribers = defaultSubscribers,
  state = defaultState,
  children,
}: {
  state?: State<any>,
  dispatch?: (...args: any[]) => any,
  subscribers?: Subscriber<any>[],
  children?: ReactNode,
}) => (
  <context.Provider
    value={{
      state,
      subscribers,
      dispatch,
    }}
  >
    {children}
  </context.Provider>
);

describe('getQuery', () => {
  it('returns an exactly matched query', () => {
    const { result } = renderHook(useCache, { wrapper });

    const query = result.current.getQuery([ 1 ]);

    expect(query).toBe(defaultState[0]);
  });
});

describe('getPromise', () => {
  it('returns a promise for the given deps', () => {
    const { result } = renderHook(useCache, { wrapper });

    const promise = result.current.getPromise([ 1 ]);

    expect(promise).toBe(defaultSubscribers[0].promise);
  });
  describe('when no subscriber exists', () => {
    it('returns undefined', () => {
      const { result } = renderHook(useCache, { wrapper });

      const promise = result.current.getPromise([ 2 ]);

      expect(promise).toBe(void 0);
    });
  });
});

describe('setPromise', () => {
  it('sets a subscriber promise', () => {
    const subscribers = defaultSubscribers.map(s => ({ ...s }));
    const { result } = renderHook(useCache, {
      wrapper,
      initialProps: {
        subscribers,
      },
    });
    const p = Promise.resolve();

    result.current.setPromise([ 1 ], p);

    expect(subscribers[0].promise).toBe(p);
  });
  describe('when subsriber does not exist', () => {
    it('creates a new subscription', () => {
      const subscribers = defaultSubscribers.map(s => ({ ...s }));
      const { result } = renderHook(useCache, {
        wrapper,
        initialProps: {
          subscribers,
        },
      });
      const p = Promise.resolve();

      result.current.setPromise([ 2 ], p);

      expect(subscribers[1].promise).toBe(p);
    });
  });
});

describe('fetching', () => {
  it('dispatches a fetch event', () => {
    const dispatch = jest.fn();
    const { result } = renderHook(useCache, {
      wrapper,
      initialProps: {
        dispatch,
      },
    });

    result.current.fetching([ 'test' ]);

    expect(dispatch).toBeCalled();
  });
});

describe('success', () => {
  it('dispatches a success event', () => {
    const dispatch = jest.fn();
    const { result } = renderHook(useCache, {
      wrapper,
      initialProps: {
        dispatch,
      },
    });

    result.current.success([ 'test' ], 'data');

    expect(dispatch).toBeCalled();
  });
});

describe('faliure', () => {
  it('dispatches a failure event', () => {
    const dispatch = jest.fn();
    const { result } = renderHook(useCache, {
      wrapper,
      initialProps: {
        dispatch,
      },
    });

    result.current.failure([ 'test' ], 'error');

    expect(dispatch).toBeCalled();
  });
});

describe('invalidate', () => {
  it('dispatches an invalidate event', () => {
    const dispatch = jest.fn();
    const { result } = renderHook(useCache, {
      wrapper,
      initialProps: {
        dispatch,
      },
    });

    result.current.invalidate({
      deps: [ 'test' ],
    });

    expect(dispatch).toBeCalled();
  });
});