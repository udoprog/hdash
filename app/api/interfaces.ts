import { Dashboard, DashboardEntry, EmbeddedDataSource, Vis, VisType } from 'api/model';
import { InjectedRouter } from 'react-router';
import { Filter } from 'api/filter';
import Request from 'request';
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
  me(): Request<Optional<User>>;

  search(filter: Filter<any>, limit: number, pageToken: Optional<string>): Request<DashboardPage>;

  searchStarred(filter: Filter<any>, limit: number, pageToken: Optional<string>): Request<DashboardPage>;

  get(id: string): Request<Optional<Dashboard>>;

  save(dashboard: Dashboard): Request<{}>;

  setStarred(dashboardId: string, starred: boolean): Request<{}>;

  getVisualization(visualizationId: string): Request<Optional<Vis>>;

  getDataSource(dataSourceId: string): Request<Optional<EmbeddedDataSource>>;

  /**
   * Export the content of the database.
   */
  export(): Request<DatabaseContent>;

  /**
   * Import database content.
   */
  import(content: DatabaseContent): Request<{}>;
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
