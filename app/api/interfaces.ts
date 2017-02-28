import { Dashboard, DashboardEntry, EmbeddedDataSource, Visualization, VisualizationType } from 'api/model';
import { InjectedRouter } from 'react-router';
import { Filter } from 'api/filter';
import { Optional } from 'optional';
import { field, MapField } from 'mapping';

/**
 * User descriptor.
 */
export class User {
  @field()
  name: string;
  @field()
  email: string;

  constructor(values: any) {
    this.name = values.name;
    this.email = values.email;
  }
}

/**
 * A complete export of the database.
 */
export class DatabaseContent {
  @field({ type: new MapField({ value: Dashboard }) })
  dashboards: { [s: string]: Dashboard };
  @field()
  starred: { [s: string]: boolean };
  @field({ type: new MapField({ value: VisualizationType }) })
  visualizations: { [s: string]: Visualization };
  @field({ type: new MapField({ value: EmbeddedDataSource }) })
  dataSources: { [s: string]: EmbeddedDataSource };
  @field({ type: User })
  user: User;

  constructor(values: any) {
    this.dashboards = values.dashboards;
    this.starred = values.starred;
    this.visualizations = values.visualizations;
    this.dataSources = values.dataSources;
    this.user = values.user;
  }
}

/**
 * Primary database.
 */
export interface Database {
  me(): Promise<Optional<User>>;

  search(filter: Filter<any>, limit: number, pageToken: Optional<string>): Promise<DashboardPage>;

  searchStarred(filter: Filter<any>, limit: number, pageToken: Optional<string>): Promise<DashboardPage>;

  get(id: string): Promise<Optional<Dashboard>>;

  save(dashboard: Dashboard): Promise<{}>;

  setStarred(dashboardId: string, starred: boolean): Promise<{}>;

  getVisualization(visualizationId: string): Promise<Optional<Visualization>>;

  getDataSource(dataSourceId: string): Promise<Optional<EmbeddedDataSource>>;

  /**
   * Export the content of the database.
   */
  export(): Promise<DatabaseContent>;

  /**
   * Import database content.
   */
  import(content: DatabaseContent): Promise<{}>;
}

export interface DashboardPage {
  results: DashboardEntry[];
  pageToken: Optional<string>;
}

export interface RouterContext {
  router: InjectedRouter;
}

export interface PagesContext {
  db: Database;
}
