import React, { Suspense } from 'react';
import { Provider } from '@respite/core';
import { renderHook, act } from '@testing-library/react-hooks';
import useState from '../../useState';
import { atom, molecule } from '../../../atoms';

const wrapper = Provider;
const wrapperWithSuspense = ({ children }: any) => (
  <Provider>
    <Suspense fallback={<div>loading...</div>}>
      {children}
    </Suspense>
  </Provider>
);

it('gets the state from the getter', async () => {
  const myConst = atom({ default: 'foo' });
  const myVar = molecule({
    get(cb) {
      const [ x ] = useState(myConst);

      return cb(() => {
        return x.split('').reverse().join('');
      }, [ x ]);

    },
  });

  const { result, waitForNextUpdate } = renderHook(() => useState(myVar), { wrapper });

  await waitForNextUpdate();

  const [ state ] = result.current;

  expect(state).toBe('oof');
});

describe('when getter is omitted', () => {
  it('returns undefined', async() => {
    const myMolecule = molecule({
      set: () => () => {
        // do something
      },
    });

    const { result, waitForNextUpdate } = renderHook(() => useState(myMolecule), { wrapper });

    await waitForNextUpdate();

    const [ state ] = result.current;

    expect(state).toBe(undefined);
  });
});

describe('when getter is async', () => {
  it('suspends the component', async () => {
    const myVar = molecule({
      get: () => new Promise<string>(() => { }),
    });

    const { result } = renderHook(() => useState(myVar), { wrapper: wrapperWithSuspense });

    // await waitForNextUpdate();
    await act(async () => { });

    expect(() => result.current).toThrow();
  });
  it('returns the resolved value', async () => {
    const myVar = molecule({
      get: () => () => new Promise(res => {
        setTimeout(() => {
          res('foo');
        }, 250);
      }),
    });

    const { result, waitForNextUpdate } = renderHook(() => {
      return useState(myVar);
    }, { wrapper: wrapperWithSuspense });

    await waitForNextUpdate();

    const [ state ] = result.current;

    expect(state).toBe('foo');
  });
});

describe('when getter takes args', () => {
  it('must pass the equivalent deps into useState', async () => {
    const myVar = molecule({
      get: (cb, [ id ]: [ string ]) => () => ({ id }),
    });

    const { result, waitForNextUpdate } = renderHook(() => useState(myVar, [ '1234' ]), { wrapper });

    await waitForNextUpdate();

    const [ state ] = result.current;

    expect(state).toEqual({ id: '1234' });
  });
});

describe('when I set a value', () => {
  it('calls the setter', async () => {
    const setter = jest.fn();
    const myVar = molecule({
      set: () => setter,
    });

    const { result, waitForNextUpdate } = renderHook(() => useState(myVar), { wrapper });

    await waitForNextUpdate();

    const [ , setState ] = result.current;

    await act(async () => {
      setState('foo');
    });

    expect(setter).toBeCalledWith('foo');
  });
  it('updates the state value', async () => {
    const reverse = (x: string) => x.split('').reverse().join('');
    const myAtom = atom({ default: 'foo' });
    const myMolecule = molecule({
      get(cb) {
        const [ x ] = useState(myAtom);
        return cb(() => reverse(x), [ x ]);
      },
      set(cb) {
        const [ , setX ] = useState(myAtom);
        return cb((value: string) => setX(reverse(value)), [ setX ]);
      },
    });

    const { result, waitForNextUpdate } = renderHook(() => {
      return {
        m: useState(myMolecule),
        a: useState(myAtom),
      };
    }, { wrapper });

    await waitForNextUpdate();

    let {
      a: [ atomState ],
      m: [ moleculeState, setState ],
    } = result.current;

    expect(atomState).toBe('foo');
    expect(moleculeState).toBe('oof');

    await act(async () => {
      setState('rab');
    });

    atomState = result.current.a[0];
    moleculeState = result.current.m[0];

    expect(atomState).toBe('bar');
    expect(moleculeState).toBe('rab');
  });
  describe('when setter is async', () => {
    it('wait for the async setter first', async () => {
      let value = 'foo';
      const myMolecule = molecule({
        get: () => () => value,
        set: () => (v: string) => {
          return new Promise<any>(res => {
            setTimeout(() => {
              value = v;
              res(void 0);
            }, 250);
          });
        },
      });

      const { result, waitForNextUpdate } = renderHook(() => useState(myMolecule), { wrapper });

      let [ state, setState ] = result.current;

      expect(state).toBe('foo');

      await act(async () => {
        setState('bar');
      });

      await waitForNextUpdate();

      [ state ] = result.current;

      expect(state).toBe('bar');
    });
  });
});

describe('when molecule depends on another atom via hooks', () => {
  describe('when dependent atom is updated', () => {
    it('updates the state', async () => {
      const myAtom = atom({ default: 'foo' });
      const myMolecule = molecule({
        get(cb) {
          const [ x ] = useState(myAtom);
          return cb(() => x, [ x ]);
        },
        set() {
          const [ , setX ] = useState(myAtom);
          return (value: string) => setX(value);
        },
      });

      const { result, waitForNextUpdate } = renderHook(() => {
        return {
          m: useState(myMolecule),
          a: useState(myAtom),
        };
      }, { wrapper });

      await waitForNextUpdate();

      let {
        a: [ atomState, setAtomState ],
        m: [ moleculeState ],
      } = result.current;

      expect(atomState).toBe('foo');
      expect(moleculeState).toBe('foo');

      await act(async () => {
        setAtomState('bar');
      });

      atomState = result.current.a[0];
      moleculeState = result.current.m[0];

      expect(atomState).toBe('bar');
      expect(moleculeState).toBe('bar');
    });
  });
});

describe('when molecule depends on another atom via { get }', () => {
  describe('when molecule is updated via set', () => {
    it('updates the atom state', async() => {
      const myAtom = atom({ default: 'foo' });
      const myMolecule = molecule<string>({
        get({ get }) {
          const state = get(myAtom);
          return state;
        },
        set({ set }) {
          const setState = set(myAtom);
          return value => {
            setState(value);
          };
        },
      });

      const { result, waitForNextUpdate } = renderHook(() => {
        return {
          m: useState(myMolecule),
          a: useState(myAtom),
        };
      }, { wrapper });

      await waitForNextUpdate();

      let {
        a: [ atomState ],
        m: [ moleculeState, setMoleculeState ],
      } = result.current;

      expect(atomState).toBe('foo');
      expect(moleculeState).toBe('foo');

      await act(async() => {
        setMoleculeState('bar');
      });

      atomState = result.current.a[0];
      moleculeState = result.current.m[0];

      expect(atomState).toBe('bar');
      expect(moleculeState).toBe('bar');
    });
  });
  describe('when dependent atom is updated', () => {
    it('updates the state', async() => {
      const myAtom = atom({ default: 'foo' });
      const myMolecule = molecule<string>({
        get({ get }) {
          const x = get(myAtom);
          return x;
        },
      });

      const { result, waitForNextUpdate } = renderHook(() => {
        return {
          m: useState(myMolecule),
          a: useState(myAtom),
        };
      }, { wrapper });

      await waitForNextUpdate();

      let {
        a: [ atomState, setAtomState ],
        m: [ moleculeState ],
      } = result.current;

      expect(atomState).toBe('foo');
      expect(moleculeState).toBe('foo');

      await act(async() => {
        setAtomState('bar');
      });

      atomState = result.current.a[0];
      moleculeState = result.current.m[0];

      expect(atomState).toBe('bar');
      expect(moleculeState).toBe('bar');
    });
  });
});