import React from 'react';
import { renderHook, act } from '@testing-library/react-hooks';
import Provider from '../Provider';
import useContext from '../../hooks/useContext';
import { ActionType, Status } from '../../constants';

const wrapper = ({ children, cacheTime }: any) => (
  <Provider
    cacheTime={cacheTime}
  >
    {children}
  </Provider>
);

it('provides the query state', () => {
  const { result } = renderHook(useContext, { wrapper });

  expect(result.current.state).toEqual([]);
});

it('provides a dispatch method', () => {
  const { result } = renderHook(useContext, { wrapper, initialProps: { cacheTime: 1000 } });

  expect(result.current.dispatch).toBeInstanceOf(Function);
});

it('dispatches events to the state', () => {
  const { result } = renderHook(useContext, { wrapper });

  act(() => {
    result.current.dispatch({
      type: ActionType.SUCCESS,
      deps: [ 1 ],
      data: 'foo',
    });
  });

  expect(result.current.state).toHaveLength(1);
  expect(result.current.state[0].status).toBe(Status.SUCCESS);
});

it('provies subscribers', () => {
  const { result } = renderHook(useContext, { wrapper });

  expect(result.current.subscribers).toEqual([]);
});
