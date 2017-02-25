import { Filter } from 'api/filter';
import { Database } from 'api/interfaces';
import { DashboardPage, DashboardEntry, DashboardData, User } from 'api/interfaces';
import { Optional, absent, of, ofNullable } from 'optional';

var store: { [s: string]: DashboardData } = {
  "a": { id: "hello", title: "Simple Title", metadata: { owner: "foo" } },
  "b": { id: "world", title: "Complex Title", metadata: { owner: "foo", relation: "tough" } },
  "c": { id: "foo", title: "Foo Title", metadata: { owner: "bar" } },
  "d": { id: "foo", title: "Foo Title", metadata: { owner: "bar", relation: "loose" } },
};

const user = {name: "John Doe", email: "john@doe.com"};

export default class MockDatabase implements Database {
  public me(): Promise<Optional<User>> {
    return Promise.resolve(of(user as User));
  }

  public get(id: string): Promise<Optional<DashboardData>> {
    return Promise.resolve(ofNullable(store[id]));
  }

  public search(filter: Filter<any>, limit: number, pageToken: Optional<string>): Promise<DashboardPage> {
    let result: DashboardEntry[] = Object.keys(store).map(key => {
      let value = store[key];

      return {
        id: key,
        title: value.title,
        metadata: value.metadata
      };
    });

    const startIndex = pageToken.map(start => JSON.parse(start)).orElse(0);

    result = result.filter(filter.apply.bind(filter));
    result.sort((a, b) => a.id.localeCompare(b.id));
    let sliced = result.slice(startIndex, startIndex + limit);

    let newPageToken = absent<string>();

    if (startIndex + limit < result.length) {
      newPageToken = of(JSON.stringify(startIndex + limit));
    }

    return Promise.resolve({ results: sliced, pageToken: newPageToken });
  }
};
