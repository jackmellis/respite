import {atom} from '../../atoms';
import useValue from '../useValue';
import useState from '../useState';
import useInitialize from '../useInitialize';
import useReset from '../useReset';
import { Provider } from '@respite/core';
import { renderHook, act } from '@testing-library/react-hooks';

const wrapper = Provider;

it('sets the initial state for an atom', async() => {
  const myAtom = atom({default:'foo'});
  const { result, waitForNextUpdate } = renderHook(() => {
    useInitialize(myAtom, 'bar');
    return useValue(myAtom);
  }, { wrapper });

  await waitForNextUpdate();

  expect(result.current).toBe('bar');
});

it('can be overwritten with setState', async() => {
  const myAtom = atom({default:'foo'});
  const { result, waitForNextUpdate } = renderHook(() => {
    useInitialize(myAtom, 'bar');
    return useState(myAtom);
  }, { wrapper });

  await waitForNextUpdate();

  expect(result.current[0]).toBe('bar');

  await act(async() => {
    result.current[1]('baz');
  });

  expect(result.current[0]).toBe('baz');
});

it('resets to the initialized value', async() => {
  const myAtom = atom({default:'foo'});
  const { result, waitForNextUpdate } = renderHook(() => {
    useInitialize(myAtom, 'bar');
    const [ state,setState ] = useState(myAtom);
    const reset = useReset(myAtom);

    return {state,setState,reset};
  }, { wrapper });

  await waitForNextUpdate();

  expect(result.current.state).toBe('bar');

  await act(async() => {
    result.current.setState('baz');
  });

  expect(result.current.state).toBe('baz');

  await act(async() => {
    result.current.reset();
  });

  expect(result.current.state).toBe('bar');
});