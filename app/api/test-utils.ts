import { decode, encode, clone, equals, Constructor } from 'mapping';

export function assertModel<T, K extends keyof T>(cls: Constructor<T>, input: any, overrides: Pick<T, K>) {
  const d = decode(input, cls);

  expect(equals(d, clone(d))).toBe(true);

  const e = encode(d);

  expect(equals(d, decode(e, cls))).toBeTruthy();

  expect(equals(d, clone(d, overrides))).toBeFalsy();
}
