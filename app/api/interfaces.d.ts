import { Dashboard, DashboardEntry, DataSource, Visualization } from 'api/model';
import { InjectedRouter } from 'react-router';
import { Filter } from 'api/filter';
import { Optional } from 'optional';

// services
declare namespace interfaces {
  interface Database {
    me(): Promise<Optional<User>>;

    search(filter: Filter<any>, limit: number, pageToken: Optional<string>): Promise<DashboardPage>;

    searchStarred(filter: Filter<any>, limit: number, pageToken: Optional<string>): Promise<DashboardPage>;

    get(id: string): Promise<Optional<Dashboard>>;

    save(dashboard: Dashboard): Promise<{}>;

    setStarred(dashboardId: string, starred: boolean): Promise<{}>;

    getVisualization(visualizationId: string): Promise<Optional<Visualization>>;

    getDataSource(dataSourceId: string): Promise<Optional<DataSource>>;
  }

  interface User {
    name: string;
    email: string;
  }

  interface DashboardPage {
    results: DashboardEntry[];
    pageToken: Optional<string>;
  }

  interface RouterContext {
    router: InjectedRouter;
  }

  interface PagesContext {
    db: Database;
  }
}

export = interfaces;
