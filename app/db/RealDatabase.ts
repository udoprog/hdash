import { Filter } from 'api/filter';
import { Database } from 'api/interfaces';
import { DashboardPage, DashboardData, User } from 'api/interfaces';
import { Optional } from 'optional';

export default class RealDatabase implements Database {
  public me(): Promise<Optional<User>> {
    return Promise.reject(new Error("not implemented"));
  }

  public get(_id: string): Promise<Optional<DashboardData>> {
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
};
