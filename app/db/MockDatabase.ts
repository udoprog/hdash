import { Filter } from 'api/filter';
import { Database } from 'api/interfaces';
import { DashboardPage, User } from 'api/interfaces';
import { Dashboard, DashboardEntry, Visualization, DataSource } from 'api/model';
import { Optional, absent, of, ofNullable } from 'optional';
import { decode } from 'mapping';

const store: { [s: string]: Dashboard } = {
  "a": decode({
    id: "hello",
    title: "Simple Title",
    metadata: { owner: "foo" },
    components: [],
    layout: []
  }, Dashboard),
  "b": decode({
    id: "world",
    title: "Complex Title",
    metadata: { owner: "foo", relation: "tough" },
    components: [],
    layout: []
  }, Dashboard),
  "c": decode({
    id: "foo",
    title: "Foo Title",
    metadata: { owner: "bar" },
    components: [],
    layout: []
  }, Dashboard),
  "d": decode({
    id: "foo",
    title: "Has Visualization",
    metadata: { owner: "bar", relation: "loose" },
    components: [
      { id: "some", title: "A title", visualization: { type: "reference", id: "a" } }
    ],
    layout: []
  }, Dashboard),
};

const starredStore: { [s: string]: boolean } = {
  "a": true
};

const visualizationStore: { [s: string]: Visualization } = {
  "a": decode({
    datasource: {
      type: "embedded",
      query: "average by host"
    }
  }, Visualization)
};

const dataSourceStore: { [s: string]: DataSource } = {
  "a": decode({
    query: "average by host"
  }, DataSource)
};

const user = { name: "John Doe", email: "john@doe.com" };

export default class MockDatabase implements Database {
  public me(): Promise<Optional<User>> {
    return Promise.resolve(of(user as User));
  }

  public get(id: string): Promise<Optional<Dashboard>> {
    return Promise.resolve(ofNullable(store[id]));
  }

  public save(dashboard: Dashboard): Promise<{}> {
    store[dashboard.id] = dashboard;
    return Promise.resolve({});
  }

  public search(filter: Filter<any>, limit: number, pageToken: Optional<string>): Promise<DashboardPage> {
    let result: DashboardEntry[] = Object.keys(store).map(key => {
      let value = store[key];

      return {
        id: key,
        title: value.title,
        metadata: value.metadata,
        starred: starredStore[key]
      };
    });

    return this.pageResult(result, filter, limit, pageToken);
  }

  public searchStarred(filter: Filter<any>, limit: number, pageToken: Optional<string>): Promise<DashboardPage> {
    let result: DashboardEntry[] = Object.keys(starredStore).map(key => {
      let value = store[key];

      return {
        id: key,
        title: value.title,
        metadata: value.metadata,
        starred: true
      };
    });

    return this.pageResult(result, filter, limit, pageToken);
  }

  public pageResult(source: DashboardEntry[], filter: Filter<any>, limit: number, pageToken: Optional<string>): Promise<DashboardPage> {
    const startIndex = pageToken.map(start => JSON.parse(start)).orElse(0);

    source = source.filter(filter.apply.bind(filter));
    source.sort((a, b) => a.id.localeCompare(b.id));
    let sliced = source.slice(startIndex, startIndex + limit);

    let newPageToken = absent<string>();

    if (startIndex + limit < source.length) {
      newPageToken = of(JSON.stringify(startIndex + limit));
    }

    return Promise.resolve({ results: sliced, pageToken: newPageToken });
  }

  public setStarred(dashboardId: string, starred: boolean): Promise<{}> {
    if (starred) {
      starredStore[dashboardId] = starred;
    } else {
      delete starredStore[dashboardId];
    }

    return Promise.resolve({});
  }

  public getVisualization(visualizationId: string): Promise<Optional<Visualization>> {
    return Promise.resolve(ofNullable(visualizationStore[visualizationId]));
  }

  public getDataSource(dataSourceId: string): Promise<Optional<DataSource>> {
    return Promise.resolve(ofNullable(dataSourceStore[dataSourceId]));
  }
};
