import React, { Suspense, useState } from 'react';
import { Provider, useQuery, Status, Query } from '@respite/query';
import { atom, molecule, useValue } from '@respite/atom';
import { renderHook } from '@testing-library/react-hooks';
import { render, act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import useSelector from '../useSelector';
import useSelectAll from '../useSelectAll';

const wrapper = ({ children }: any) => (
  <Provider>
    {children}
  </Provider>
);

it('returns a new query', () => {
  const { result: { current } } = renderHook(() => {
    const query = useQuery('foo', () => Promise.resolve('foo'));
    return useSelector(query, x => x.split('').reverse().join(''));
  }, { wrapper });

  expect(current.status).toBe(Status.IDLE);
});
it('mimics the status of the original query', async() => {
  const Child = ({ query }: { query: Query<string> }) => (
    <div>
      <div>{query.data}</div>
    </div>
  );
  const Parent = () => {
    const [ showData, setShowData ] = useState(false);
    const query = useQuery('foo', () => Promise.resolve('foo'));
    const newQuery = useSelector(query, x => x.split('').reverse().join(''));

    return (
      <div>
        <div>
          {newQuery.status}
        </div>
        {showData && <Child query={newQuery}/>}
        <button onClick={() => setShowData(true)}>x</button>
      </div>
    );
  };

  render(
    <Suspense fallback={<div>loading...</div>}>
      <Parent/>
    </Suspense>, { wrapper });

  await screen.findByText(Status.IDLE);
  
  userEvent.click(screen.getByRole('button'));

  await screen.findByText(Status.SUCCESS);
});

describe('when I access data', () => {
  it('suspends the component', async() => {
    const Child = ({ query }: { query: Query<string> }) => (
      <div>
        <div>{query.data}</div>
      </div>
    );
    const Parent = () => {
      const query = useQuery('foo', () => new Promise<string>(() => {}));
      const newQuery = useSelector(query, x => x.split('').reverse().join(''));
  
      return (
        <div>
          <div>
            {newQuery.status}
          </div>
          {Child({ query: newQuery })}
        </div>
      );
    };
  
    render(
      <Suspense fallback={<div>loading...</div>}>
        <Parent/>
      </Suspense>, { wrapper });
  
    await screen.findByText('loading...');
  });
  it('calls the selector function', async() => {
    const fn = jest.fn((x: string) => x.split('').reverse().join(''));
    const Child = ({ query }: { query: Query<string> }) => (
      <div>
        <div>{query.data}</div>
      </div>
    );
    const Parent = () => {
      const query = useQuery('foo', () => Promise.resolve('foo'));
      const newQuery = useSelector(query, fn);
  
      return (
        <div>
          <div>
            {newQuery.status}
          </div>
          {Child({ query: newQuery })}
        </div>
      );
    };
  
    render(
      <Suspense fallback={<div>loading...</div>}>
        <Parent/>
      </Suspense>, { wrapper });
  
    
    await act(async() => new Promise(res => setTimeout(res, 50)));

    expect(fn).toBeCalledWith('foo');
  });
  it('returns the transformed data property', async() => {
    const fn = jest.fn((x: string) => x.split('').reverse().join(''));
    const Child = ({ query }: { query: Query<string> }) => (
      <div>
        <div>{query.data}</div>
      </div>
    );
    const Parent = () => {
      const query = useQuery('foo', () => Promise.resolve('foo'));
      const newQuery = useSelector(query, fn);
  
      return (
        <div>
          <div>
            {newQuery.status}
          </div>
          {Child({ query: newQuery })}
        </div>
      );
    };
  
    render(
      <Suspense fallback={<div>loading...</div>}>
        <Parent/>
      </Suspense>, { wrapper });
  
    
    await screen.findByText('oof');
  });
  describe('when the query data changes', () => {
    it('returns the newly transformed data', async() => {
      const fn = jest.fn((x: string) => x.split('').reverse().join(''));
      const Child = ({ query }: { query: Query<string> }) => (
        <div>
          <div>{query.data}</div>
        </div>
      );
      const Parent = () => {
        const [ v, s ] = useState('foo');
        const query = useQuery('foo', () => Promise.resolve(v), [ v ]);
        const newQuery = useSelector(query, fn);
    
        return (
          <div>
            <div>
              {newQuery.status}
            </div>
            {Child({ query: newQuery })}
            <div>
              <button onClick={() => s('bah')}>change</button>
            </div>
          </div>
        );
      };
    
      render(
        <Suspense fallback={<div>loading...</div>}>
          <Parent/>
        </Suspense>, { wrapper });
    
      
      await screen.findByText('loading...');
      await screen.findByText(Status.SUCCESS);
      await screen.findByText('oof');

      userEvent.click(screen.getByRole('button'));

      await act(async() => {
        await screen.findByText(Status.FETCHING);
      });

      await screen.findByText(Status.SUCCESS);
      await screen.findByText('hab');
    });
  });
});

describe('when I provide multiple queries', () => {
  it('sets the status to the "lowest ready state"', async() => {
    const fn = jest.fn();
    const Parent = () => {
      const q1 = {
        status: Status.SUCCESS,
        $$isQuery: true,
      } as any;
      const q2 = {
        status: Status.FETCHING,
        $$isQuery: true,
      } as any;
      const q3 = {
        status: Status.ERROR,
        $$isQuery: true,
      } as any;
      const query = useSelectAll([ q1, q2, q3 ], fn);

      return (
        <div>
          {query.status}
        </div>
      );
    };

    render(<Parent/>, { wrapper });

    await screen.findByText(Status.FETCHING);
  });
  describe('when I access data', () => {
    it('suspends until all queries are "ready"', async() => {
      const Parent = () => {
        const q1 = useQuery('one', () => new Promise<string>(res => {
          res('1');
        }));
        const q2 = useQuery('two', () => new Promise<string>(res => {
          setTimeout(() => {
            res('2');
          }, 500);
        }));
        const query = useSelectAll([ q1, q2 ], (one, two) => {
          return Number(one + two);
        });

        return (
          <div>
            {query.data}
          </div>
        );
      };

      render(
        <Suspense fallback={<div>loading...</div>}>
          <Parent/>
        </Suspense>,
        { wrapper }
      );

      await screen.findByText('loading...');

      await new Promise(res => setTimeout(res, 100));

      await screen.findByText('loading...');

      await screen.findByText('12');
    });
  });
});

describe('when I provide an atom', () => {
  it('returns the transformed value immediately', async() => {
    const person = atom({ default: { first: 'jim', last: 'smith' } });
    const useName = () => useSelector(person, x => `${x.first} ${x.last}`);

    const { result, waitForNextUpdate } = renderHook(() => useName(), { wrapper });

    await waitForNextUpdate();

    expect(result.current).toBe('jim smith');
  });
});

describe('when I provide multiple atoms', () => {
  it('returns the transformed value immediately', async() => {
    const heights = atom({ default: [
      {
        id: 1,
        height: 100,
      },
      {
        id: 2,
        height: 200,
      },
      {
        id: 3,
        height: 300,
      },
    ] });
    const ages = atom({ default: [
      {
        id: 1,
        age: 44,
      },
      {
        id: 2,
        age: 10,
      },
      {
        id: 3,
        age: 33,
      },
    ] });
    const useHeightAge = (id: number) => useSelectAll([ heights, ages ], (heights, ages) => {
      const height = heights.find(h => h.id === id).height;
      const age = ages.find(a => a.id === id).age;
      return { height, age };
    }, [ id ]);

    const { result, waitForNextUpdate } = renderHook(() => {
      return useHeightAge(2);
    }, { wrapper });

    await waitForNextUpdate();

    expect(result.current.age).toBe(10);
    expect(result.current.height).toBe(200);
  });
});

describe('when I provide a molecule', () => {
  it('returns the transformed value immediately', async() => {
    const person = molecule<{ id: number, first: string, last: string }, [ number ]>({
      get(cb, [ id ]) {
        return {
          id,
          first: 'jim',
          last: 'smith',
        };
      },
    });
    const useName = (id: number) => useSelector(person, p => `${p.first} ${p.last} (${p.id})`, [ id ]);

    const { result, waitForNextUpdate } = renderHook(() => useName(1), { wrapper });

    await waitForNextUpdate();

    expect(result.current).toBe('jim smith (1)');
  });
});

describe('when I provide multiple molecules', () => {
  it('returns the transformed value immediately', async() => {
    const idAtom = atom({ default: 1 });
    const heightsAtom = molecule({
      get: () => [
        {
          id: 1,
          height: 100,
        },
        {
          id: 2,
          height: 200,
        },
        {
          id: 3,
          height: 300,
        },
      ],
    });
    const agesAtom = molecule({
      get: () => [
        {
          id: 1,
          age: 44,
        },
        {
          id: 2,
          age: 10,
        },
        {
          id: 3,
          age: 33,
        },
      ],
    });
    const personAtom = molecule<{ first: string, last: string }>({
      get(cb) {
        const id = useValue(idAtom);
        return cb(() => {
          return {
            id,
            first: 'jim',
            last: 'smith',
          };
        }, [ id ]);
      },
    });
    const usePerson = (id: number) => useSelectAll([ heightsAtom, agesAtom, personAtom ], (heights, ages, person) => {
      const height = heights.find(h => h.id === id).height;
      const age = ages.find(a => a.id === id).age;
      return {
        ...person,
        height,
        age,
      };
    }, [ id ]);

    const { result, waitForNextUpdate } = renderHook(() => {
      return usePerson(useValue(idAtom));
    }, { wrapper });

    await waitForNextUpdate();

    expect(result.current).toEqual({
      id: 1,
      first: 'jim',
      last: 'smith',
      age: 44,
      height: 100,
    });
  });
});