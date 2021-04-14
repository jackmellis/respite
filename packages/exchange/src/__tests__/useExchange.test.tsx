import React, { Suspense } from 'react';
import { render, act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider, useQuery } from '@respite/query';
import { useAction } from '@respite/action';
import useExchange from '../useExchange';

describe('when an action and a query are exchanged', () => {
  describe('when an action is fulfilled', () => {
    it('invalidates the query', async() => {
      const fetch = jest.fn().mockResolvedValue('test data');
      const mutate = jest.fn().mockResolvedValue({});

      const Component = () => {
        const { action } = useAction('my-action', mutate);
        const query = useQuery<string>('test', fetch);
        useExchange([ 'test', 'my-action' ]);

        return (
          <div>
            <h1>{query.data}</h1>
            <button onClick={action}>click me</button>
          </div>
        );
      };

      await act(async () => {
        render(
          <Provider>
            <Suspense fallback={null}>
              <Component />
            </Suspense>
          </Provider>
        );
      });

      await screen.findByText('test data');

      expect(fetch).toBeCalledTimes(1);
      expect(mutate).not.toBeCalled();

      userEvent.click(screen.getByText('click me'));

      await act(async () => {});

      expect(mutate).toBeCalledTimes(1);
      expect(fetch).toBeCalledTimes(2);
    });
  });
});