import * as React from 'react';
import { Row, Col, Grid } from 'react-bootstrap';
import { Pager } from 'react-bootstrap';
import { Optional, absent, of, ofNullable } from 'optional';
import { AndFilter, MetadataFilter, TitleFilter } from 'api/filter';
import { PagesContext, RouterContext } from 'api/interfaces';
import { DashboardEntry } from 'api/model';
import { Filter } from 'api/filter';
import * as shallowEqual from 'is-equal-shallow';
import DashboardSearchForm from 'components/DashboardSearchForm';
import DashboardList from 'components/DashboardList';

const META_PREFIX = "m_";
const TITLE_PREFIX = "t_";
const DEFAULT_LIMIT = 20;

interface Props {
  location: any,
  route: {
    test: string
  }
}

interface State {
  dashboards: DashboardEntry[];
  nextPageToken: Optional<string>;
  pageToken: Optional<string>;
  starredDashboards: DashboardEntry[];
  starredNextPageToken: Optional<string>;
  starredPageToken: Optional<string>;
  filters: Filter<any>[];
  limit: Optional<number>;
}

export default class DashboardsPage extends React.PureComponent<Props, State> {
  context: PagesContext & RouterContext;

  readonly setPageToken: (pageToken: string) => void;
  readonly setStarredPageToken: (pageToken: string) => void;

  public static contextTypes: any = {
    db: React.PropTypes.object,
    router: React.PropTypes.any
  };

  constructor(props: any) {
    super(props);

    const {query} = props.location;

    this.state = {
      dashboards: [],
      nextPageToken: absent<string>(),
      pageToken: ofNullable(query.pageToken),
      starredDashboards: [],
      starredNextPageToken: absent<string>(),
      starredPageToken: absent<string>(),
      filters: this.filtersFromQuery(query),
      limit: of(ofNullable(query.limit).map(parseInt).orElse(DEFAULT_LIMIT))
    } as State;

    this.setPageToken = nextPageToken => {
      this.setState({ pageToken: of(nextPageToken), nextPageToken: absent<string>() }, () => {
        this.updateUrl();
        this.updateDashboards();
      });
    };

    this.setStarredPageToken = nextPageToken => {
      this.setState({ starredPageToken: of(nextPageToken), starredNextPageToken: absent<string>() }, () => {
        this.updateUrl();
        this.updateDashboards();
      });
    };
  }

  public componentDidMount(): void {
    this.updateDashboards();
  }

  public render() {
    const {limit, filters} = this.state;
    const {starredDashboards, dashboards} = this.state;
    const {pageToken, nextPageToken} = this.state;
    const {starredPageToken, starredNextPageToken} = this.state;

    return (
      <Grid>
        <Row>
          <Col sm={12}>
            <h4>Search</h4>

            <DashboardSearchForm
              limit={limit}
              filters={filters}
              onRemoveFilter={f => this.removeFilter(f)}
              onAddFilter={f => this.addFilter(f)}
              onChangeLimit={limit => this.setLimit(limit)} />
          </Col>
        </Row>

        <Row>
          <Col sm={6}>
            <h4>All Dashboards</h4>

            <DashboardList
              dashboards={dashboards}
              onAddMetadataFilter={(key, value) => this.addMetadataFilter(key, value)}
              onToggleStarred={(dashboard) => this.toggleStarred(dashboard)} />

            <Pager>
              {pageToken.map(_ => {
                return <Pager.Item previous href="#" onClick={() => this.reset()}>Reset</Pager.Item>
              }).get()}

              {nextPageToken.map(nextToken => {
                return <Pager.Item next href="#" onClick={() => this.setPageToken(nextToken)}>Next Page &rarr;</Pager.Item>;
              }).get()}
            </Pager>
          </Col>

          <Col sm={6}>
            <h4>Favorites</h4>

            <DashboardList
              dashboards={starredDashboards}
              onAddMetadataFilter={(key, value) => this.addMetadataFilter(key, value)}
              onToggleStarred={(dashboard) => this.toggleStarred(dashboard)} />

            <Pager>
              {starredPageToken.map(_ => {
                return <Pager.Item previous href="#" onClick={() => this.resetStarred()}>Reset</Pager.Item>
              }).get()}

              {starredNextPageToken.map(nextToken => {
                return <Pager.Item next href="#" onClick={() => this.setStarredPageToken(nextToken)}>Next Page &rarr;</Pager.Item>;
              }).get()}
            </Pager>
          </Col>
        </Row>
      </Grid>
    );
  }

  private filtersFromQuery(query: { [key: string]: string }): Filter<any>[] {
    const filters: Filter<any>[] = [];

    Object.keys(query).forEach(key => {
      if (key.startsWith(META_PREFIX)) {
        var k = key.substring(2);
        filters.push(new MetadataFilter(k, query[key]));
      } else if (key.startsWith(TITLE_PREFIX)) {
        filters.push(new TitleFilter(query[key]));
      }
    });

    return filters;
  }

  private setLimit(limit: number): void {
    this.setState({ limit: of(limit) }, () => {
      this.updateDashboards();
      this.updateUrl();
    });
  }

  private removeFilter(filter: Filter<any>): void {
    this.setState((prev, _) => {
      return { filters: prev.filters.filter(f => !f.equals(filter)) };
    }, () => {
      this.updateUrl();
      this.updateDashboards();
    })
  }

  private reset(): void {
    this.setState({ pageToken: absent<string>() }, () => {
      this.updateUrl();
      this.updateDashboards();
    });
  }

  private resetStarred(): void {
    this.setState({ starredPageToken: absent<string>() }, () => {
      this.updateUrl();
      this.updateDashboards();
    });
  }

  private addMetadataFilter(key: string, value: string): void {
    this.addFilter(new MetadataFilter(key, value));
  }

  private toggleStarred(dashboard: DashboardEntry): void {
    this.context.db.setStarred(dashboard.id, !dashboard.starred).then(() => {
      this.setState((prev, _) => {
        const dashboards = prev.dashboards.map(d => {
          if (d.id === dashboard.id) {
            return Object.assign({}, d, { starred: !dashboard.starred });
          }

          return d;
        });

        const starredDashboards = dashboards.filter(d => {
          return d.starred;
        });

        return { dashboards: dashboards, starredDashboards: starredDashboards };
      });
    });
  }

  private addFilter(filter: Filter<any>): boolean {
    this.setState((prev, _) => {
      if (prev.filters.some(f => f.equals(filter))) {
        return prev;
      }

      return {
        filters: prev.filters.concat([filter]),
        pageToken: absent<string>()
      }
    }, () => {
      this.updateUrl();
      this.updateDashboards();
    })

    return false;
  }

  private updateUrl(): void {
    const {router} = this.context;
    const {pathname, query} = this.props.location;
    const {pageToken, filters} = this.state;

    let nextQuery: any = {};

    nextQuery.limit = this.state.limit.orElse(query.limit);

    pageToken.accept(pageToken => {
      nextQuery.pageToken = pageToken;
    });

    var titleIndex = 0;

    filters.forEach(filter => {
      if (filter instanceof MetadataFilter) {
        nextQuery[META_PREFIX + filter.key] = filter.value;
      } else if (filter instanceof TitleFilter) {
        nextQuery[TITLE_PREFIX + titleIndex++] = filter.value;
      }
    });

    const q = Object.assign({}, query);

    if (!shallowEqual(q, nextQuery)) {
      router.push({
        pathname: pathname,
        query: nextQuery
      });
    }
  }

  private updateDashboards(): void {
    let filter = new AndFilter(this.state.filters);
    let {pageToken, starredPageToken} = this.state;

    const limit = this.state.limit.orElse(DEFAULT_LIMIT);

    this.context.db.searchStarred(filter, limit, starredPageToken).then(page => {
      this.setState({ starredDashboards: page.results, starredNextPageToken: page.pageToken });
    });

    this.context.db.search(filter, limit, pageToken).then(page => {
      this.setState({ dashboards: page.results, nextPageToken: page.pageToken });
    });
  }
};
