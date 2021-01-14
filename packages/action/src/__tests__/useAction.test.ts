import { renderHook, act } from '@testing-library/react-hooks';
import useAction from '../useAction';
import { useQuery, Provider, Status } from '@respite/query';

const swap = (promise: Promise<any>) => promise.then(r => Promise.reject(r), e => e);

const wrapper = Provider;

it('returns an action query object', () => {
  const { result: { current } } = renderHook(() => useAction(() => Promise.resolve('foo')), { wrapper } );

  expect(typeof current.action).toBe('function');
  expect(current.status).toBe(Status.IDLE);
  expect(current.submitting).toBe(false);
});

describe('when I call action', () => {
  it('sets status to loading', async() => {
    const { result } = renderHook(() => {
      return useAction(() => new Promise(() => {}));
    }, { wrapper });

    act(() => {
      result.current.action();
    });

    expect(result.current.status).toBe(Status.LOADING);
    expect(result.current.submitting).toBe(true);
  });

  describe('when action succeeds', () => {
    it('resolves the result', async() => {
      const { result } = renderHook(() => {
        return useAction(() => Promise.resolve('foo'));
      }, { wrapper });

      let data: string;

      await act(async() => {
        data = await result.current.action();
      });

      expect(data).toBe('foo');
    });
    it('sets status to success', async() => {
      const { result } = renderHook(() => {
        return useAction(() => Promise.resolve('foo'));
      }, { wrapper });

      const { action } = result.current;

      await act(action);

      const { status } = result.current;

      expect(status).toBe(Status.SUCCESS);
    });
    it('sets data to the result', async() => {
      const { result } = renderHook(() => {
        return useAction(() => Promise.resolve('foo'));
      }, { wrapper });

      const { action } = result.current;

      await act(action);

      const { data } = result.current;

      expect(data).toBe('foo');
    });
    it('invalidates my queries', async() => {
      const fn = jest.fn()
        .mockReturnValueOnce('test1')
        .mockReturnValueOnce('test2')
        .mockReturnValueOnce('test3')
        .mockImplementation(() => new Promise(() => {}));
      const { result } = renderHook(() => {
        const q1 = useQuery('test1', fn, [], { prefetch: true });
        const q2 = useQuery('test2', fn, [], { prefetch: true });
        const q3 = useQuery('test3', fn, [], { prefetch: true });

        // eslint-disable-next-line max-len
        const { action, invalidate } = useAction(() => Promise.resolve('foo'));

        return {
          q1,
          q2,
          q3,
          action,
          invalidate,
        };
      }, { wrapper });

      await act(async() => {});

      const { action } = result.current;

      expect(result.current.q1.status).toBe(Status.SUCCESS);
      expect(result.current.q2.status).toBe(Status.SUCCESS);
      expect(result.current.q3.status).toBe(Status.SUCCESS);

      await act(action);
      await act(async() => {
        const { invalidate, q2 } = result.current;
        invalidate({
          predicate: q => q.deps[0] === 'test1',
        });
        
        q2.invalidate();

        invalidate({
          deps: [ 'test3' ],
          exact: false,
        });
      });

      expect(result.current.q1.status).toBe(Status.FETCHING);
      expect(result.current.q2.status).toBe(Status.FETCHING);
      expect(result.current.q3.status).toBe(Status.FETCHING);
    });

    describe('when I reset the action', () => {
      it('sets the status to idle', async() => {
        const { result } = renderHook(() => {
          return useAction(() => Promise.resolve('foo'));
        }, { wrapper });
  
        const { action } = result.current;
  
        await act(action);
  
        let { status, reset } = result.current;
  
        expect(status).toBe(Status.SUCCESS);

        await act(async() => {
          reset();
        });

        status = result.current.status;

        expect(status).toBe(Status.IDLE);
      });
      it('sets data to null', async() => {
        const { result } = renderHook(() => {
          return useAction(() => Promise.resolve('foo'));
        }, { wrapper });
  
        const { action } = result.current;
  
        await act(action);
  
        let { data, reset } = result.current;
  
        expect(data).toBe('foo');

        await act(async() => {
          reset();
        });

        data = result.current.data;

        expect(data).toBe(null);
      });
    });
  });

  describe('when action throws an error', () => {
    it('rejects the promise', async() => {
      const { result } = renderHook(() => {
        return useAction(() => Promise.reject('foo'));
      }, { wrapper });

      const { action } = result.current;

      await act(() => swap(action()));
    });
    it('sets the status to error', async() => {
      const { result } = renderHook(() => {
        return useAction(() => Promise.reject('foo'));
      }, { wrapper });

      const { action } = result.current;

      await act(() => swap(action()));

      const { status } = result.current;

      expect(status).toBe(Status.ERROR);
    });
    it('sets the error to the error object', async() => {
      const { result } = renderHook(() => {
        return useAction(() => Promise.reject('foo'));
      }, { wrapper });

      const { action } = result.current;

      await act(() => swap(action()));

      const { error } = result.current;

      expect(error).toBe('foo');
    });
  });

  describe('when component is unmounted', () => {
    it.todo('does not attempt to dispatch any events');
  });
});