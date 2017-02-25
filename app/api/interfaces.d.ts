import {InjectedRouter} from 'react-router';

// services
declare namespace interfaces {
  interface Database {
    search(filter: Filter<any>, limit: number, pageToken?: string): Promise<DashboardPage>;

    get(id: string): Promise<DashboardData | null>;
  }

  interface DashboardPage {
    results: DashboardEntry[];
    pageToken?: string;
  }

  interface DashboardEntry {
    id: string;
    title: string;
    metadata: { [key:string]:string; };
  }

  interface DashboardData {
    id: string;
    title: string;
    metadata: { [key:string]:string; };
  }

  interface RouterContext {
    router: InjectedRouter;
  }

  interface PagesContext {
    db: Database;
  }
}

export = interfaces;
