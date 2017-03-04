import { Dashboard, DashboardEntry, EmbeddedDataSource, Vis, VisType } from 'api/model';
import { InjectedRouter } from 'react-router';
import { Filter } from 'api/filter';
import { Optional } from 'optional';
import { field, types } from 'mapping';

/**
 * User descriptor.
 */
export class User {
  @field(types.String)
  name: string;
  @field(types.String)
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
  @field(types.Map(Dashboard))
  dashboards: { [s: string]: Dashboard };
  @field(types.Map(types.Boolean))
  starred: { [s: string]: boolean };
  @field(types.Map(VisType))
  visualizations: { [s: string]: Vis };
  @field(types.Map(EmbeddedDataSource))
  dataSources: { [s: string]: EmbeddedDataSource };
  @field(User)
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

  getVisualization(visualizationId: string): Promise<Optional<Vis>>;

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
