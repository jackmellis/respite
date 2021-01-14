import React from 'react';
import { Provider } from '@respite/query';
import QueryTodos from './query-todos';
import AtomTodos from './atom-todos';

export default {
  title: 'Todo',
};

export const queries = () => (
  <Provider>
    <QueryTodos/>
  </Provider>
);

export const atoms = () => (
  <Provider>
    <AtomTodos/>
  </Provider>
);