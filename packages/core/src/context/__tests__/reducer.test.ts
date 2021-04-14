import { ActionType, Status } from '../../constants';
import { State } from '../context';
import {
  updateQuery,
  fetching,
  success,
  failure,
  invalidate,
} from '../reducer';

const createState = ():State<any> => [
  {
    status: Status.LOADING,
    deps: [ 1, 'foo' ] as [ 1, 'foo' ],
    data: null,
    error: null,
    created: null,
    promise: null,
    subscribers: 0,
  },
  {
    status: Status.SUCCESS,
    deps: [ 2, 'bah' ] as [ 2, 'bah' ],
    error: null,
    data: 'baz',
    created: null,
    promise: null,
    subscribers: 0,
  },
  {
    status: Status.IDLE,
    deps: [ 2, 'buzz', 1 ] as [ 2, 'buzz', 1 ],
    data: null,
    error: null,
    created: null,
    promise: null,
    subscribers: 0,
  },
];
const createPubSub = () => ({
  subscribe: jest.fn(),
  dispatch: jest.fn(),
});

describe('updateQuery', () => {
  it('merges props into a given query in the state', () => {
    const state = createState();
    const pubSub = createPubSub();
    updateQuery(state, [ 1, 'foo' ], { data: 'foo' }, pubSub);

    expect(state).toHaveLength(3);
    expect(state[0].data).toBe('foo');
  });
  describe('when query does not exist', () => {
    it('creates a new one', () => {
      const state = createState();
      const pubSub = createPubSub();
      updateQuery(state, [ 1, 'z' ], { data: 'foo' }, pubSub);

      expect(state).toHaveLength(4);
      expect(state[3]).toEqual({
        deps: [ 1, 'z' ],
        status: Status.IDLE,
        data: 'foo',
        created: expect.any(Date),
        error: undefined,
        promise: null,
        subscribers: 0,
      });
    });
  });
});

describe('fetching', () => {
  it('sets status to loading', () => {
    const state = createState();
    const pubSub = createPubSub();

    fetching(state, {
      type: ActionType.FETCHING,
      deps: [ 2, 'bah' ],
    }, pubSub);

    expect(state[1].status).toBe(Status.LOADING);
  });
});

describe('success', () => {
  it('sets the query data', () => {
    const state = createState();
    const pubSub = createPubSub();

    success(state, {
      type: ActionType.SUCCESS,
      deps: [ 1, 'foo' ],
      data: 'FOO',
    }, pubSub);

    expect(state[0].status).toBe(Status.SUCCESS);
    expect(state[0].data).toBe('FOO');
  });
});

describe('failure', () => {
  it('sets the query error', () => {
    const state = createState();
    const pubSub = createPubSub();

    failure(state, {
      type: ActionType.FAILURE,
      deps: [ 1, 'foo' ],
      error: 'FOO',
    }, pubSub);

    expect(state[0].status).toBe(Status.ERROR);
    expect(state[0].error).toBe('FOO');
  });
});

describe('invalidate', () => {
  describe('exact', () => {
    it('removes a query that matches exactly', () => {
      const state = createState();
      const pubSub = createPubSub();

      invalidate(state, {
        type: ActionType.INVALIDATE,
        deps: [ 2, 'bah' ],
        exact: true,
      }, pubSub);

      expect(state[0].status).toBe(Status.LOADING);
      expect(state[1].status).toBe(Status.IDLE);
      expect(state[2].status).toBe(Status.IDLE);
    });
  });
  describe('loose', () => {
    it('removes all queries that loosely match', () => {
      const state = createState();
      const pubSub = createPubSub();

      invalidate(state, {
        type: ActionType.INVALIDATE,
        deps: [ 2, 'bah' ],
        exact: false,
      }, pubSub);

      expect(state[0].status).toBe(Status.LOADING);
      expect(state[1].status).toBe(Status.IDLE);
      expect(state[2].status).toBe(Status.IDLE);
    });
  });
  describe('predicate', () => {
    it('removes all queries that match the predicate', () => {
      const state = createState();
      const pubSub = createPubSub();

      invalidate(state, {
        type: ActionType.INVALIDATE,
        predicate: query => query.data != null,
      }, pubSub);

      expect(state[0].status).toBe(Status.LOADING);
      expect(state[1].status).toBe(Status.IDLE);
      expect(state[2].status).toBe(Status.IDLE);
    });
  });
});
