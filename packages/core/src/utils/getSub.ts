import { compareDeps } from './queries';
import type { Deps, Subscriber } from '../types';

export default function<T>(subscribers: Subscriber<T>[],  deps: Deps) {
  return subscribers.find(sub => compareDeps(deps, sub.deps));
}