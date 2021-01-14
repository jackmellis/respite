import { renderHook, act } from '@testing-library/react-hooks';
import { Provider } from '@respite/core';
import { atom } from '../../atoms';
import useState from '../useState';
import useReset from '../useReset';

const wrapper = Provider;

test('resets an atom', async() => {
  const nameAtom = atom({ default: 'joe' });
  
  const { result, waitForNextUpdate } = renderHook(() => {
    const [ state, setState ] = useState(nameAtom);
    const reset = useReset(nameAtom);
    return {
      state,
      setState,
      reset,
    };
  }, { wrapper });

  await waitForNextUpdate();

  let {
    state,
    setState,
    reset,
  } = result.current;

  expect(state).toBe('joe');

  await act(async() => {
    setState('ollie');
  });

  state = result.current.state;
  reset = result.current.reset;

  expect(state).toBe('ollie');

  await act(async() => {
    reset();
  });

  state = result.current.state;

  expect(state).toBe('joe');
});