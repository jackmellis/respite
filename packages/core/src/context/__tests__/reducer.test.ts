import { act, renderHook } from '@testing-library/react-hooks';
import { ActionType, Status } from '../../constants';
import useReducer, {
  updateQuery,
  fetching,
  success,
  failure,
  invalidate,
} from '../reducer';

const state = [
  {
    status: Status.LOADING,
    deps: [ 1, 'foo' ] as [ 1, 'foo' ],
    data: null,
    error: null,
  },
  {
    status: Status.SUCCESS,
    deps: [ 2, 'bah' ] as [ 2, 'bah' ],
    error: null,
    data: 'baz',
  },
  {
    status: Status.IDLE,
    deps: [ 2, 'buzz', 1 ] as [ 2, 'buzz', 1 ],
    data: null,
    error: null,
  },
];

describe('updateQuery', () => {
  it('merges props into a given query in the state', () => {
    const result = updateQuery(state, [ 1, 'foo' ], { data: 'foo' });

    expect(result).toHaveLength(3);
    expect(result[0].data).toBe('foo');
  });
  it('does not mutate the state', () => {
    updateQuery(state, [ 1, 'foo' ], { data: 'foo' });

    expect(state).toHaveLength(3);
    expect(state[0].data).toBe(null);
  });
  describe('when query does not exist', () => {
    it('creates a new one', () => {
      const result = updateQuery(state, [ 1, 'z' ], { data: 'foo' });

      expect(result).toHaveLength(4);
      expect(result[3]).toEqual({
        deps: [ 1, 'z' ],
        status: Status.IDLE,
        data: 'foo',
      });
    });
  });
});

describe('fetching', () => {
  it('sets status to loading', () => {
    const result = fetching(state, {
      type: ActionType.FETCHING,
      deps: [ 2, 'bah' ],
    });

    expect(result[1].status).toBe(Status.LOADING);
  });
});

describe('success', () => {
  it('sets the query data', () => {
    const result = success(state, {
      type: ActionType.SUCCESS,
      deps: [ 1, 'foo' ],
      data: 'FOO',
    });

    expect(result[0].status).toBe(Status.SUCCESS);
    expect(result[0].data).toBe('FOO');
  });
});

describe('failure', () => {
  it('sets the query error', () => {
    const result = failure(state, {
      type: ActionType.FAILURE,
      deps: [ 1, 'foo' ],
      error: 'FOO',
    });

    expect(result[0].status).toBe(Status.ERROR);
    expect(result[0].error).toBe('FOO');
  });
});

describe('invalidate', () => {
  describe('exact', () => {
    it('removes a query that matches exactly', () => {
      const result = invalidate(state, {
        type: ActionType.INVALIDATE,
        deps: [ 2, 'bah' ],
        exact: true,
      });

      expect(result).toEqual([ state[0], state[2] ]);
    });
  });
  describe('loose', () => {
    it('removes all queries that loosely match', () => {
      const result = invalidate(state, {
        type: ActionType.INVALIDATE,
        deps: [ 2, 'bah' ],
        exact: false,
      });

      expect(result).toEqual([ state[0] ]);
    });
  });
  describe('predicate', () => {
    it('removes all queries that match the predicate', () => {
      const result = invalidate(state, {
        type: ActionType.INVALIDATE,
        predicate: query => query.data != null,
      });

      expect(result).toEqual([ state[0], state[2] ]);
    });
  });
});

describe('useReducer', () => {
  it('returns a react reducer', () => {
    const { result } = renderHook(useReducer);

    act(() => {
      result.current[1]({
        type: ActionType.FETCHING,
        deps: [ 'test1' ],
      });
    });

    act(() => {
      result.current[1]({
        type: ActionType.SUCCESS,
        deps: [ 'test2' ],
        data: 'data',
      });
    });

    act(() => {
      result.current[1]({
        type: ActionType.FAILURE,
        deps: [ 'test3' ],
        error: 'error',
      });
    });

    act(() => {
      result.current[1]({
        type: ActionType.INVALIDATE,
        deps: [ 'test4' ],
        exact: false,
        predicate: null,
      });
    });

    act(() => {
      result.current[1]({
        type: 'UNKNOWN' as any,
      });
    });
  });
});