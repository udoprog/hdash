import { Filter } from 'api/filter';
import { Database } from 'api/interfaces';
import { DashboardPage, User, DatabaseContent } from 'api/interfaces';
import { Dashboard, DashboardEntry, Vis, DataSource } from 'api/model';
import { Optional, absent, of, ofNullable } from 'optional';
import Initial from './MockDatabaseInitial';
import { encode, decode } from 'mapping';
import Request from 'request';

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

  public me(): Request<Optional<User>> {
    return Request.resolve(of(this.content.user as User));
  }

  public get(id: string): Request<Optional<Dashboard>> {
    return Request.resolve(ofNullable(this.content.dashboards[id]));
  }

  public save(dashboard: Dashboard): Request<void> {
    this.content.dashboards[dashboard.id] = dashboard;
    this.write();
    return Request.resolve();
  }

  public search(filter: Filter<any>, limit: number, pageToken: Optional<string>): Request<DashboardPage> {
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

  public searchStarred(filter: Filter<any>, limit: number, pageToken: Optional<string>): Request<DashboardPage> {
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

  public pageResult(source: DashboardEntry[], filter: Filter<any>, limit: number, pageToken: Optional<string>): Request<DashboardPage> {
    const startIndex = pageToken.map(start => JSON.parse(start)).orElse(0);

    source = source.filter(filter.apply.bind(filter));
    source.sort((a, b) => a.id.localeCompare(b.id));
    let sliced = source.slice(startIndex, startIndex + limit);

    let newPageToken = absent<string>();

    if (startIndex + limit < source.length) {
      newPageToken = of(JSON.stringify(startIndex + limit));
    }

    return Request.resolve({ results: sliced, pageToken: newPageToken });
  }

  public setStarred(dashboardId: string, starred: boolean): Request<void> {
    if (starred) {
      this.content.starred[dashboardId] = starred;
    } else {
      delete this.content.starred[dashboardId];
    }

    this.write();
    return Request.resolve();
  }

  public getVisualization(visualizationId: string): Request<Optional<Vis>> {
    return new Request(new Promise((resolve, _reject) => {
      setTimeout(() => {
        resolve(ofNullable(this.content.visualizations[visualizationId]));
      }, 500);
    }));
  }

  public getDataSource(dataSourceId: string): Request<Optional<DataSource>> {
    return Request.resolve(ofNullable(this.content.dataSources[dataSourceId]));
  }

  public export(): Request<DatabaseContent> {
    return Request.resolve(this.content);
  }

  public import(content: DatabaseContent): Request<void> {
    this.content = content;
    return Request.resolve();
  }
};
