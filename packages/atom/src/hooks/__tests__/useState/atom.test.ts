import { useState as useReactState } from 'react';
import { renderHook, act } from '@testing-library/react-hooks';
import { Provider } from '@respite/core';
import { useQuery } from '@respite/query';
import { atom } from '../../../atoms';
import useState from '../../useState';

const wrapper = Provider;

it('returns the initial value', async() => {
  const myAtom = atom({
    default: 'dog',
  });
  const { result, waitForNextUpdate } = renderHook(() => useState(myAtom), { wrapper });

  await waitForNextUpdate();

  const [ state ] = result.current;

  expect(state).toBe('dog');
});

describe('when I set state', () => {
  it('updates the state value', async() => {
    const myAtom = atom({
      default: 'dog',
    });
    const { result, waitForNextUpdate } = renderHook(() => useState(myAtom), { wrapper });

    await waitForNextUpdate();

    const [ , setState ] = result.current;

    await act(async() => {
      setState('cat');
    });

    const [ state ] = result.current;

    expect(state).toBe('cat');
  });
  it('updates all instances of the atom', async() => {
    const myAtom = atom({
      default: 'dog',
    });
    const { result, waitForNextUpdate } = renderHook(() => {
      const a = useState(myAtom);
      const b = useState(myAtom);
      return { a, b };
    }, { wrapper });

    await waitForNextUpdate();

    const { a: [ , setState ] } = result.current;

    await act(async() => {
      setState('cat');
    });

    const {
      a: [ stateA ],
      b: [ stateB ],
    } = result.current;

    expect(stateA).toBe('cat');
    expect(stateB).toBe('cat');
  });
});

describe('when I use an atom as a query key', () => {
  // this doesn't work right now because we match queries on _exact_ dependencies
  // so useState has a single dep of ATOM whereas the userQuery call has ATOM + count
  // which means they're classed as 2 separate queries
  // a possible solution would be to make atom.getState actually first check for an existing query
  // with the ATOM key...
  it.skip('passes the query response into the atom', async() => {
    const ATOM = atom<string>();

    const { result, waitForNextUpdate } = renderHook(() => {
      const [ count, setCount ] = useReactState(0);
      const query = useQuery(ATOM, () => `count is ${count}`, [ count ]);
      const [ state, setState ] = useState(ATOM);

      return {
        setCount,
        query,
        state,
        setState,
      };
    }, { wrapper });

    await waitForNextUpdate();

    expect(result.current.state).toBe('count is 1');
    
    // update the atom
    await act(async() => {
      result.current.setState('count is 3');
    });

    expect(result.current.state).toBe('count is 3');

    // update the query
    await act(async() => {
      result.current.query.data = 'count is 7';
    });

    expect(result.current.state).toBe('count is 7');

    // update the count (aka the query dependency)
    await act(async() => {
      result.current.setCount(10);
    });

    expect(result.current.state).toBe('count is 10');
  });
});