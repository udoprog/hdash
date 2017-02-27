import { decode, encode, clone, equals, Constructor } from 'mapping';
import * as model from 'api/model';
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
  it('should handle Dashboard', () => {
    const d = decode({
      id: "hello",
      title: "Simple Title",
      metadata: { owner: "foo" },
      components: [],
      layout: []
    }, model.Dashboard);

    assertModel(d, model.Dashboard, { title: "other" });
  });

  it('should handle Component', () => {
    const d = decode({
      id: "hello",
      title: "Foo Bar",
      showTitle: false,
      visualization: {type: 'reference', id: 'a'},
      datasource: {type: 'reference', id: 'a'}
    }, model.Component);

    assertModel(d, model.Component, { title: "other" });
  });

  it('should handle DataSource', () => {
    const d = decode({
      query: "Query"
    }, model.DataSource);

    assertModel(d, model.DataSource, { query: "Other Query" });
  });
});
