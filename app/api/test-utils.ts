import { decode, encode, clone, equals, Constructor } from 'mapping';
import { assert } from 'chai';

export function assertModel<T, K extends keyof T>(cls: Constructor<T>, input: any, overrides: Pick<T, K>) {
  const d = decode(input, cls);

  assert.isTrue(
    equals(d, clone(d)),
    "clone should be same");

  const e = encode(d);

  assert.isTrue(
    equals(d, decode(e, cls)),
    "decode/encode should be same");

  assert.isFalse(
    equals(d, clone(d, overrides)),
    "modified should be different");
}
