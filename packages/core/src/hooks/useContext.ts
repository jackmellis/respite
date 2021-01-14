import React from 'react';
import context from '../context/context';
import type { Context } from '../types';

export default function useContext<T>(): Context<T> {
  const result = React.useContext(context);
  if (result == null) {
    throw new Error('You must wrap your app in @respite\'s <Provider>');
  }
  return result;
}