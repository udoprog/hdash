import { Filter } from 'api/filter';
import { Database } from 'api/interfaces';
import { DashboardPage, DashboardEntry, DashboardData } from 'api/interfaces';

var store: { [s: string]: DashboardData } = {
  "hello": { id: "hello", title: "Simple Title", metadata: { owner: "simple" } },
  "world": { id: "world", title: "Complex Title", metadata: { owner: "complex" } },
  "foo": { id: "foo", title: "Foo Title", metadata: { owner: "simple" } },
};

export default class MockDatabase implements Database {
  public get(id: string): Promise<DashboardData | null> {
    let d = store[id];

    if (!d) {
      return Promise.resolve(null);
    }

    return Promise.resolve(d);
  }

  public search(filter: Filter<any>, limit: number, pageToken?: string): Promise<DashboardPage> {
    let result: DashboardEntry[] = Object.keys(store).map(key => {
      let value = store[key];

      return {
        id: key,
        title: value.title,
        metadata: value.metadata
      };
    });

    let startIndex = 0;

    if (pageToken) {
      startIndex = JSON.parse(pageToken);
    }

    result = result.filter(filter.apply.bind(filter));
    result.sort((a, b) => a.id.localeCompare(b.id));
    let sliced = result.slice(startIndex, startIndex + limit);

    let newPageToken = null;

    if (startIndex + limit < result.length) {
      newPageToken = JSON.stringify(startIndex + limit);
    }

    return Promise.resolve({ results: sliced, pageToken: newPageToken });
  }
};
