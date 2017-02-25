import { Database, Filter } from 'api/interfaces';
import { DashboardPage, DashboardData } from 'api/interfaces';

export default class RealDatabase implements Database {
  public get(id: string): Promise<DashboardData | null> {
    return Promise.reject(new Error("No such id: " + id));
  }

  public search(_filter: Filter<any>, _limit: number, _pageToken?: string): Promise<DashboardPage> {
    return Promise.resolve({ results: [], pageToken: null });
  }
};
