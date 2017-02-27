import { decode, encode, clone, equals, Constructor } from 'mapping';
import * as heroic from 'api/heroic';
import { assert } from 'chai';

function assertModel<T, K extends keyof T>(d: T, cls: Constructor<T>, overrides: Pick<T, K>) {
  assert.isTrue(
    equals(d, clone(d)),
    "clone should be same");

  assert.isTrue(
    equals(d, decode(encode(d), cls)),
    "decode/encode should be same");

  assert.isFalse(
    equals(d, clone(d, overrides)),
    "modified should be different");
}

describe("This is a test", () => {
  it('should handle Sampling', () => {
    const d = decode({
      sampling: {size: 42, unit: "seconds"}
    }, heroic.SumAggregation);

    assertModel(d, heroic.SumAggregation, {sampling: null});
  });
});
