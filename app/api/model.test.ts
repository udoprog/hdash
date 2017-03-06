import * as model from 'api/model';
import { assertModel } from './test-utils';

describe('model', () => {
  it('should handle Dashboard', () => {
    assertModel(model.Dashboard, {
      id: "hello",
      title: "Simple Title",
      metadata: { owner: "foo" },
      range: { start: { type: 'now' }, end: { type: 'now' } },
      components: [],
      layout: []
    }, { title: "other" });
  });

  it('should handle Component', () => {
    assertModel(model.Component, {
      id: "hello",
      title: "Foo Bar",
      visualization: { type: 'reference', id: 'a' }
    }, { title: "other" });
  });

  it('should handle DataSource', () => {
    assertModel(model.EmbeddedDataSource, {
      query: "Query"
    }, { query: "Other Query" });
  });
});
