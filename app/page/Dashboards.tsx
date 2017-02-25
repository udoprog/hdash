import * as React from 'react';
import { Row, Col } from 'react-bootstrap';
import { Pager } from 'react-bootstrap';
import { Typeahead } from 'react-bootstrap-typeahead';
import { Optional, absent, of, ofNullable } from 'optional';
import { AndFilter, MetadataFilter } from 'api/filter';
import { PagesContext, RouterContext, DashboardEntry } from 'api/interfaces';
import { Filter } from 'api/filter';
import * as shallowEqual from 'is-equal-shallow';
import DashboardSearchForm from 'components/DashboardSearchForm';
import DashboardList from 'components/DashboardList';

const DEFAULT_LIMIT = 20;

interface Props {
  location: any,
  route: {
    test: string
  }
}

interface State {
  dashboards: DashboardEntry[];
  filters: Filter<any>[];
  nextPageToken: Optional<string>;
  limit: Optional<number>;
  pageToken: Optional<string>;
}

export default class Dashboards extends React.PureComponent<Props, State> {
  context: PagesContext & RouterContext;

  readonly setPageToken: (pageToken: string) => void;

  public static contextTypes: any = {
    db: React.PropTypes.object,
    router: React.PropTypes.any
  };

  constructor(props: any) {
    super(props);

    const {query} = props.location;

    this.state = {
      dashboards: [],
      filters: [],
      nextPageToken: absent<string>(),
      limit: of(ofNullable(query.limit).map(parseInt).orElse(DEFAULT_LIMIT)),
      pageToken: ofNullable(query.pageToken)
    } as State;

    this.setPageToken = nextPageToken => {
      this.setState({ pageToken: of(nextPageToken), nextPageToken: absent<string>() }, () => {
        this.updateUrl();
        this.updateDashboards();
      });
    };
  }

  public componentDidMount(): void {
    this.updateDashboards();
  }

  public componentDidUpdate(prevProps: Props): void {
    const {query, key} = this.props.location;

    if (prevProps.location.key !== key) {
      const limit = parseInt(query.limit) || DEFAULT_LIMIT;
      const pageToken = ofNullable(query.pageToken);

      this.setState({ limit: of(limit), pageToken: pageToken }, () => {
        this.updateDashboards();
      });
    }
  }

  public handleTypeahead(selection?: string) {
    console.log(selection);
  }

  public render() {
    const {limit, filters, pageToken, nextPageToken} = this.state;
    const {dashboards} = this.state;

    return (
      <Row>
        <Col sm={6}>
          <h4>Favorites</h4>

          <Typeahead onChange={(selection: string) => this.handleTypeahead(selection)}
            options={["foo", "bar", "baz"]} />
        </Col>

        <Col sm={6}>
          <h4>Search</h4>

          <DashboardSearchForm
            limit={limit}
            filters={filters}
            onRemoveFilter={f => this.removeFilter(f)}
            onAddFilter={f => this.addFilter(f)}
            onChangeLimit={limit => this.setLimit(limit)} />

          <DashboardList dashboards={dashboards} onAddMetadataFilter={this.addMetadataFilter.bind(this)} />

          <Pager>
            {pageToken.map(_ => {
              return <Pager.Item previous href="#" onClick={this.reset.bind(this)}>Reset</Pager.Item>
            }).get()}

            {nextPageToken.map(nextToken => {
              return <Pager.Item next href="#" onClick={() => this.setPageToken(nextToken)}>Next Page &rarr;</Pager.Item>;
            }).get()}
          </Pager>
        </Col>
      </Row>
    );
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

  private addMetadataFilter(key: string, value: string): void {
    this.addFilter(new MetadataFilter(key, value));
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
    const {pageToken} = this.state;

    let nextQuery: any = {};

    nextQuery.limit = this.state.limit.orElse(query.limit);

    pageToken.ifPresent(pageToken => {
      nextQuery.pageToken = pageToken;
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
    let {pageToken} = this.state as State;

    this.state.limit.ifPresent(limit => {
      let p = this.context.db.search(filter, limit, pageToken);

      p.then(page => {
        this.setState({ dashboards: page.results, nextPageToken: page.pageToken });
      }, reason => {
        console.log(reason);
      });
    });
  }
};
