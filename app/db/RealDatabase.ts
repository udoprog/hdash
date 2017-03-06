import { DatabaseContent } from 'api/interfaces';
import { Filter } from 'api/filter';
import { Database } from 'api/interfaces';
import { DashboardPage, User } from 'api/interfaces';
import { Dashboard, Vis, DataSource } from 'api/model';
import { Optional } from 'optional';
import Request from 'request';

export default class RealDatabase implements Database {
  public me(): Request<Optional<User>> {
    return Request.reject(new Error("not implemented"));
  }

  public get(_id: string): Request<Optional<Dashboard>> {
    return Request.reject(new Error("not implemented"));
  }

  public save(_dashboard: Dashboard): Request<{}> {
    return Request.reject(new Error("not implemented"));
  }

  public search(_filter: Filter<any>, _limit: number, _pageToken: Optional<string>): Request<DashboardPage> {
    return Request.reject(new Error("not implemented"));
  }

  public searchStarred(_filter: Filter<any>, _limit: number, _pageToken: Optional<string>): Request<DashboardPage> {
    return Request.reject(new Error("not implemented"));
  }

  public setStarred(_dashboardId: string, _started: boolean): Request<{}> {
    return Request.reject(new Error("not implemented"));
  }

  public getVisualization(_visualizationId: string): Request<Optional<Vis>> {
    return Request.reject(new Error("not implemented"));
  }

  public getDataSource(_dataSourceId: string): Request<Optional<DataSource>> {
    return Request.reject(new Error("not implemented"));
  }

  public export(): Request<DatabaseContent> {
    return Request.reject(new Error("not implemented"));
  }

  public import(_content: DatabaseContent): Request<{}> {
    return Request.reject(new Error("not implemented"));
  }
};
