import { Filter } from 'api/filter';
import { Database } from 'api/interfaces';
import { DashboardPage, User, DatabaseContent } from 'api/interfaces';
import { Dashboard, DashboardEntry, Visualization, DataSource } from 'api/model';
import { Optional, absent, of, ofNullable } from 'optional';
import Initial from './MockDatabaseInitial';
import { encode, decode } from 'mapping';

export default class MockDatabase implements Database {
  private content: DatabaseContent;

  constructor() {
    if (!localStorage.getItem('content')) {
      this.content = Initial;
      this.write();
    } else {
      this.read();
    }
  }

  public static clear() {
    localStorage.removeItem('content');
  }

  private write() {
    localStorage.setItem('content', JSON.stringify(encode(this.content)));
  }

  private read() {
    const contentString = localStorage.getItem('content');

    if (contentString) {
      this.content = decode(JSON.parse(contentString), DatabaseContent);
    }
  }

  public me(): Promise<Optional<User>> {
    return Promise.resolve(of(this.content.user as User));
  }

  public get(id: string): Promise<Optional<Dashboard>> {
    return Promise.resolve(ofNullable(this.content.dashboards[id]));
  }

  public save(dashboard: Dashboard): Promise<{}> {
    this.content.dashboards[dashboard.id] = dashboard;
    this.write();
    return Promise.resolve({});
  }

  public search(filter: Filter<any>, limit: number, pageToken: Optional<string>): Promise<DashboardPage> {
    let result: DashboardEntry[] = Object.keys(this.content.dashboards).map(key => {
      let value = this.content.dashboards[key];

      return {
        id: key,
        title: value.title,
        metadata: value.metadata,
        starred: this.content.starred[key]
      };
    });

    return this.pageResult(result, filter, limit, pageToken);
  }

  public searchStarred(filter: Filter<any>, limit: number, pageToken: Optional<string>): Promise<DashboardPage> {
    let result: DashboardEntry[] = Object.keys(this.content.starred).map(key => {
      let value = this.content.dashboards[key];

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
      this.content.starred[dashboardId] = starred;
    } else {
      delete this.content.starred[dashboardId];
    }

    this.write();
    return Promise.resolve({});
  }

  public getVisualization(visualizationId: string): Promise<Optional<Visualization>> {
    return new Promise((resolve, _reject) => {
      setTimeout(() => {
        resolve(ofNullable(this.content.visualizations[visualizationId]));
      }, 500);
    });
  }

  public getDataSource(dataSourceId: string): Promise<Optional<DataSource>> {
    return Promise.resolve(ofNullable(this.content.datasources[dataSourceId]));
  }

  public export(): Promise<DatabaseContent> {
    return Promise.resolve(this.content);
  }

  public import(content: DatabaseContent): Promise<{}> {
    this.content = content;
    return Promise.resolve({});
  }
};
