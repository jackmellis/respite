import React, { Suspense } from 'react';
import useAction from '../useAction';
import useSnapshot from '../useSnapshot';
import { useQuery, Provider } from '@respite/query';
import { render, act, screen } from '@testing-library/react';
import userEvent  from '@testing-library/user-event';

const wrapper = (props: any) => (
  <Provider>
    <Suspense fallback={<div>loading...</div>}>
      {props.children}
    </Suspense>
  </Provider>
);

it('stores and reverts a query', async() => {
  let callback;
  const Component = () => {
    const query = useQuery('count', () => Promise.resolve(1));
    const snapshot = useSnapshot(query);
    const { action } = useAction(() => {
      return new Promise(() => {
        const revert = snapshot(count => count + 1);
        callback = () => {
          revert();
        };
      });
    });

    return (
      <div>
        <span>count: {query.data}</span>
        <button onClick={action}>increment</button>
      </div>
    );
  };

  render(<Component/>, { wrapper });

  await screen.findByText('count: 1');

  const button = screen.getByRole('button');

  userEvent.click(button);

  await act(async() => {});

  await screen.findByText('count: 2');

  await act(async() => {
    callback();
  }); 

  await screen.findByText('count: 1');
});