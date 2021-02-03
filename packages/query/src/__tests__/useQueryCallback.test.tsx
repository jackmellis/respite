import { Status, Provider } from '@respite/core';
import { renderHook, act } from '@testing-library/react-hooks';
import useQuery from '../useQuery';
import useQueryCallback from '../useQueryCallback';

const wrapper = Provider;

it('returns a function', () => {
  const fetch = jest.fn().mockResolvedValue('foo');

  const { result } = renderHook(() => {
    return useQueryCallback('key', fetch);
  }, { wrapper });

  expect(result.current).toBeInstanceOf(Function);
  expect(fetch).not.toBeCalled();
});

it('fetches the data', async () => {
  const fetch = jest.fn().mockResolvedValue('foo');

  const { result } = renderHook(() => {
    return useQueryCallback('key', fetch);
  }, { wrapper });

  await act(async () => {
    expect(await (await result.current([ '1234' ])).data).toBe('foo');
  });

  expect(fetch).toBeCalledWith([ '1234' ]);
});

it('caches the result', async () => {
  const fetch = jest.fn().mockResolvedValue('foo');

  const { result } = renderHook(
    () => {
      const fn = useQueryCallback('key', fetch);
      const query = useQuery('key', fetch, [ '1234' ]);

      return { fn, query };
    },
    { wrapper }
  );

  expect(result.current.query.status).toBe(Status.IDLE);

  await act(async () => {
    await result.current.fn([ '1234' ]);
  });

  expect(result.current.query.status).toBe(Status.SUCCESS);
});

describe('when fetch errors', () => {
  it('throws an error', async () => {
    const fetch = jest.fn().mockRejectedValue(new Error('boo-urns'));

    const { result } = renderHook(() => {
      return useQueryCallback('key', fetch);
    }, { wrapper });
  
    await act(async () => {
      expect(result.current([ '1234' ])).rejects.toThrow();
    });
  });
});

describe('when data is already cached', () => {
  it('uses the cached data', async () => {
    const fetch = jest.fn().mockResolvedValue('foo');

    const { result } = renderHook(
      () => {
        const fn = useQueryCallback('key', fetch);
        const query = useQuery('key', fetch, [ '1234' ]);
  
        return { fn, query };
      },
      { wrapper }
    );
  
    expect(result.current.query.status).toBe(Status.IDLE);

    await act(async() => {
      try {
        result.current.query.data;
      } catch (e) {
        if (!(e instanceof Promise)) {
          throw e;
        }
      }
    });
  
    expect(result.current.query.status).toBe(Status.SUCCESS);

    await act(async () => {
      expect((await result.current.fn([ '1234' ])).data).toBe('foo');
    });
  
    expect(fetch).toBeCalledTimes(1);
  });
});

describe('when data is loading', () => {
  it('waits for the existing fetch to complete', async () => {
    const fetch = jest.fn(() => new Promise(res => setTimeout(() => res('foo'), 1000)));

    const { result } = renderHook(
      () => {
        const fn = useQueryCallback('key', fetch);
        const query = useQuery('key', fetch, [ '1234' ]);
  
        return { fn, query };
      },
      { wrapper }
    );
  
    expect(result.current.query.status).toBe(Status.IDLE);
    
    // start fetching the query but don't wait for it to finish
    act(() => {
      try {
        result.current.query.data;
      } catch (e) {
        if (!(e instanceof Promise)) {
          throw e;
        }
      }
    });

    
    await act(() => new Promise(res => setTimeout(res, 100)));

    // we should still be loading the data at this point
    expect(result.current.query.status).toBe(Status.LOADING);

    await act(async () => {
      // now  we attempt to fetch the data but we're already fetching the data
      // from the above query, so the callback should just piggyback onto the exising promise
      expect((await result.current.fn([ '1234' ])).data).toBe('foo');
    });
  
    expect(fetch).toBeCalledTimes(1);
  });
});
