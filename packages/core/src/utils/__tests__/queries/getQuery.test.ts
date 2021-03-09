import { Status } from '../../../constants';
import { getQuery } from '../../queries';
import { Deps, State } from '../../../types';

const state: State<any> = [
  {
    deps: [ 'a' ] as Deps,
    status: Status.ERROR,
    data: null,
    error: null,
    created: new Date(),
    promise: null,
    subscribers: [],
  },
  {
    deps: [ 'b' ] as Deps,
    status: Status.IDLE,
    data: null,
    error: null,
    created: new Date(),
    promise: null,
    subscribers: [],
  },
];

it('finds a query based on a predicate function', () => {
  const [ result, i ] = getQuery(state, query => query.status === Status.IDLE);
  
  expect(result).toBe(state[1]);
  expect(i).toBe(1);
});

describe('when not found', () => {
  it('returns nothing', () => {
    const [ result, i ] = getQuery(state, () => false);

    expect(result).toBe(void 0);
    expect(i).toBe(-1);
  });
});