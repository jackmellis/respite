import { Status } from '../../../constants';
import { getQuery } from '../../queries';
import { Deps } from '../../../types';

const state = [
  {
    deps: [ 'a' ] as Deps,
    status: Status.ERROR,
    data: null,
    error: null,
  },
  {
    deps: [ 'b' ] as Deps,
    status: Status.IDLE,
    data: null,
    error: null,
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