import { renderHook } from '@testing-library/react-hooks';
import { Provider } from '@respite/core';
import { atom, molecule } from '../../atoms';
import useValue from '../useValue';

const wrapper = Provider;

test('returns the state part of an atom', async() => {
  const nameAtom = atom({ default: 'fred' });

  const { result, waitForNextUpdate } = renderHook(() => useValue(nameAtom), { wrapper });
  await waitForNextUpdate();

  const { current: name } = result;

  expect(name).toBe('fred');
});

test('returns the state part of a molecule', async() => {
  const personAtom = atom({ default: { first: 'fred', last: 'bloggs' } });
  const nameMolecule = molecule<string, [ string ]>({
    get(cb, [ title ]) {
      const { first, last } = useValue(personAtom);
      return cb(() => `${title} ${first} ${last}`, [ first, last ]);
    },
  });

  const { result, waitForNextUpdate } = renderHook(() => useValue(nameMolecule, [ 'mr' ]), { wrapper });
  await waitForNextUpdate();

  const { current: name } = result;

  expect(name).toBe('mr fred bloggs');
});