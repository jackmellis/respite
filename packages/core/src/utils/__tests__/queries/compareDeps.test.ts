import { compareDeps } from '../../queries';

describe('when deps are different lengths', () => {
  it('returns false', () => {
    expect(compareDeps([ 1 ], [ 1, 2 ])).toBe(false);
    expect(compareDeps([ 1, 2 ], [ 1 ])).toBe(false);
  });
});

describe('when all deps strictly match', () => {
  it('returns true', () => {
    const foo = {};
    const bah = {};

    expect(compareDeps([ foo, bah ], [ foo, bah ])).toBe(true);
  });
});

describe('when all deps loosely match', () => {
  it('returns false', () => {
    expect(compareDeps([ {} ], [ {} ])).toBe(false);
  });
});

describe('when any deps do not match', () => {
  it('returns false', () => {
    expect(compareDeps([ 1, 2, 3 ], [ 1, 4, 3 ])).toBe(false);
  });
});