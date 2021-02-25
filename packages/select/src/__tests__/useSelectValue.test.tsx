import React, { Suspense, useState } from 'react';
import { Provider, useQuery } from '@respite/query';
import { molecule } from '@respite/atom';
import { renderHook } from '@testing-library/react-hooks';
import { render, act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import useSelectValue from '../useSelectValue';

const wrapper = ({ children }: any) => (
  <Provider>
    {children}
  </Provider>
);

describe('when I call the hook', () => {
  it('suspends the component', async() => {
    const Parent = () => {
      const query = useQuery('foo', () => new Promise<string>(() => {}));
      const value = useSelectValue(query, x => x.split('').reverse().join(''));
  
      return (
        <div>
          {value}
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
    const Parent = () => {
      const query = useQuery('foo', () => Promise.resolve('foo'));
      const value = useSelectValue(query, fn);
  
      return (
        <div>
          {value}
        </div>
      );
    };
  
    render(
      <Suspense fallback={<div>loading...</div>}>
        <Parent/>
      </Suspense>, { wrapper });
  
    
    await act(async() => {});

    expect(fn).toBeCalledWith('foo');
  });
  it('returns the transformed data property', async() => {
    const fn = jest.fn((x: string) => x.split('').reverse().join(''));
    const Parent = () => {
      const query = useQuery('foo', () => Promise.resolve('foo'));
      const value = useSelectValue(query, fn);
  
      return (
        <div>
          {value}
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
      const Parent = () => {
        const [ v, s ] = useState('foo');
        const query = useQuery('foo', () => Promise.resolve(v), [ v ]);
        const value = useSelectValue(query, fn);
    
        return (
          <div>
            <div>
              {value}
            </div>
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
      await screen.findByText('oof');

      userEvent.click(screen.getByRole('button'));

      await screen.findByText('hab');
    });
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
    const useName = (id: number) => useSelectValue(person, p => `${p.first} ${p.last} (${p.id})`, [ id ]);

    const { result, waitForNextUpdate } = renderHook(() => useName(1), { wrapper });

    await waitForNextUpdate();

    expect(result.current).toBe('jim smith (1)');
  });
});
