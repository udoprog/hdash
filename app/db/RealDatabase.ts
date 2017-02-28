import { DatabaseContent } from 'api/interfaces';
import { Filter } from 'api/filter';
import { Database } from 'api/interfaces';
import { DashboardPage, User } from 'api/interfaces';
import { Dashboard, Visualization, DataSource } from 'api/model';
import { Optional } from 'optional';

export default class RealDatabase implements Database {
  public me(): Promise<Optional<User>> {
    return Promise.reject(new Error("not implemented"));
  }

  public get(_id: string): Promise<Optional<Dashboard>> {
    return Promise.reject(new Error("not implemented"));
  }

  public save(_dashboard: Dashboard): Promise<{}> {
    return Promise.reject(new Error("not implemented"));
  }

  public search(_filter: Filter<any>, _limit: number, _pageToken: Optional<string>): Promise<DashboardPage> {
    return Promise.reject(new Error("not implemented"));
  }

  public searchStarred(_filter: Filter<any>, _limit: number, _pageToken: Optional<string>): Promise<DashboardPage> {
    return Promise.reject(new Error("not implemented"));
  }

  public setStarred(_dashboardId: string, _started: boolean): Promise<{}> {
    return Promise.reject(new Error("not implemented"));
  }

  public getVisualization(_visualizationId: string): Promise<Optional<Visualization>> {
    return Promise.reject(new Error("not implemented"));
  }

  public getDataSource(_dataSourceId: string): Promise<Optional<DataSource>> {
    return Promise.reject(new Error("not implemented"));
  }

  public export(): Promise<DatabaseContent> {
    return Promise.reject(new Error("not implemented"));
  }

  public import(_content: DatabaseContent): Promise<{}> {
    return Promise.reject(new Error("not implemented"));
  }
};
