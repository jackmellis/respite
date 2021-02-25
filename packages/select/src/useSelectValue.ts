import { Atom, isQuery, Molecule, Query } from '@respite/core';
import useSelector from './useSelector';

function useSelectValue<T, R>(query: Query<T>, selector: (t: T) => R, deps?: any[]): R;
function useSelectValue<T, R>(atom: Atom<T> | Molecule<T>, selector: (t: T) => R, deps?: any[]): R;
function useSelectValue(
  query: any,
  selector: any,
  deps: any[] = [],
) {
  const result = useSelector(query, selector, deps);

  return isQuery(query) ? result.data : result;
}

export default useSelectValue;