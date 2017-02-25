import { Filter } from 'api/filter';
import { Database } from 'api/interfaces';
import { DashboardPage, DashboardData } from 'api/interfaces';
import { Optional, absent } from 'optional';

export default class RealDatabase implements Database {
  public get(id: string): Promise<Optional<DashboardData>> {
    return Promise.reject(new Error("No such id: " + id));
  }

  public search(_filter: Filter<any>, _limit: number, _pageToken: Optional<string>): Promise<DashboardPage> {
    return Promise.resolve({ results: [], pageToken: absent<string>() });
  }
};
