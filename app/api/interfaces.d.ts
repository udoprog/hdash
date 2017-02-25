import { DashboardEntry } from 'api/interfaces';
import { InjectedRouter } from 'react-router';
import { Filter } from 'api/filter';
import { Optional } from 'optional';

// services
declare namespace interfaces {
  interface Database {
    me(): Promise<Optional<User>>;

    search(filter: Filter<any>, limit: number, pageToken: Optional<string>): Promise<DashboardPage>;

    searchStarred(filter: Filter<any>, limit: number, pageToken: Optional<string>): Promise<DashboardPage>;

    get(id: string): Promise<Optional<DashboardData>>;

    setStarred(dashboardId: string, starred: boolean): Promise<{}>;
  }

  interface User {
    name: string;
    email: string;
  }

  interface DashboardPage {
    results: DashboardEntry[];
    pageToken: Optional<string>;
  }

  interface DashboardEntry {
    id: string;
    title: string;
    metadata: { [key: string]: string; };
    starred: boolean;
  }

  interface DashboardData {
    id: string;
    title: string;
    metadata: { [key: string]: string; };
  }

  interface RouterContext {
    router: InjectedRouter;
  }

  interface PagesContext {
    db: Database;
  }
}

export = interfaces;
