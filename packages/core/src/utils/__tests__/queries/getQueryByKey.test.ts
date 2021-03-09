import { Status } from '../../../constants';
import { getQueryByKey } from '../../queries';
import { Deps } from '../../../types';

const state = [
  {
    deps: [ 'a', 12 ] as Deps,
    status: Status.ERROR,
    data: null,
    error: null,
    created: new Date(),
    promise: null,
    subscribers: [],
  },
  {
    deps: [ 'b', 34 ] as Deps,
    status: Status.IDLE,
    data: null,
    error: null,
    created: new Date(),
    promise: null,
    subscribers: [],
  },
];

it('finds a query based on the key', () => {
  const [ result, i ] = getQueryByKey(state, 'b');
  
  expect(result).toBe(state[1]);
  expect(i).toBe(1);
});

describe('when not found', () => {
  it('returns nothing', () => {
    const [ result, i ] = getQueryByKey(state, 'c');

    expect(result).toBe(void 0);
    expect(i).toBe(-1);
  });
});