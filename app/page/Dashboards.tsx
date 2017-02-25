import * as React from 'react';
import { Link } from 'react-router';
import { Row, Col } from 'react-bootstrap';
import { Pager, InputGroup, Form, FormGroup, Button, ControlLabel, FormControl } from 'react-bootstrap';
import { Typeahead } from 'react-bootstrap-typeahead';
import { If, Then, Else } from 'react-if';

import { AndFilter, MetadataFilter, TitleFilter } from 'api/filter';
import { BoundValidator, validators } from 'forms';

import { PagesContext, RouterContext, DashboardEntry } from 'api/interfaces';
import { Filter } from 'api/filter';

import * as shallowEqual from 'is-equal-shallow';

const DEFAULT_LIMIT = 20;

const validateLimit = validators.integer({
  checks: [validators.min(1), validators.max(50)]
});

interface DashboardListProps {
  dashboards: DashboardEntry[];
  onAddMetadataFilter: (key: string, value: string) => void;
}

interface DashboardListState {
}

class DashboardList extends React.PureComponent<DashboardListProps, DashboardListState | any> {
  public render() {
    const {dashboards, onAddMetadataFilter} = this.props;

    return (
      <div>
        {dashboards.map((d, i) => {
          return (
            <div key={i}>
              <Link to={`/dashboard/${d.id}`}>{d.title}</Link>

              <div>
                {Object.keys(d.metadata).map(k => {
                  const v = d.metadata[k];
                  return <Button onClick={() => onAddMetadataFilter(k, v)} bsStyle="primary" bsSize="xs" key={i}>
                    {k}:{v}
                  </Button>;
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  }
}

interface SearchFormProps {
  limit: number;
  filters: Filter<any>[];
  onAddFilter: (filter: Filter<any>) => void;
  onRemoveFilter: (filter: Filter<any>) => void;
  onChangeLimit: (limit: number | null) => void;
}

interface SearchFormState {
  addFilterValue: string;
}

class SearchForm extends React.PureComponent<SearchFormProps, SearchFormState | any> {
  limit: BoundValidator<number>;

  constructor(props: any) {
    super(props);

    this.state = {
      addFilterValue: "",
    } as SearchFormState;

    this.limit = validateLimit.bind(() => this.props.limit, {
      onChange: props.onChangeLimit
    });
  }

  private removeFilter(filter: Filter<any>): void {
    this.props.onRemoveFilter(filter);
  }

  private addFilterKey(e: any): boolean {
    e.preventDefault();

    if (e.key === 'Enter') {
      return this.addFilterEvent(e);
    }

    return false;
  }

  private addFilterEvent(e: any): boolean {
    e.preventDefault();

    const {addFilterValue} = this.state;

    const index = addFilterValue.indexOf(':');

    if (index >= 1) {
      const key = addFilterValue.substring(0, index);
      const value = addFilterValue.substring(index + 1);
      this.props.onAddFilter(new MetadataFilter(key, value));
    } else {
      this.props.onAddFilter(new TitleFilter(addFilterValue));
    }

    this.setState({addFilterValue: ""});
    return false;
  }

  public render() {
    const {addFilterValue} = this.state as SearchFormState;
    const {filters} = this.props;

    return <Form onSubmit={this.addFilterEvent.bind(this)}>
      <FormGroup controlId="formLimit" validationState={this.limit.$validationState}>
        <ControlLabel>Limit:</ControlLabel>

        <FormControl
          type="number"
          value={this.limit.value()}
          onChange={this.limit.onChange}
          componentClass="input"
          placeholder="select" />

        <ControlLabel>{this.limit.$feedback}</ControlLabel>
      </FormGroup>

      <FormGroup controlId="formAddFilter">
        <ControlLabel>Add Filter:</ControlLabel>

        <InputGroup>
          <FormControl
            type="text"
            value={addFilterValue}
            placeholder="Enter Filter"
            onKeyUp={this.addFilterKey.bind(this)}
            onChange={(e: any) => this.setState({ addFilterValue: e.target.value as string })} />

          <InputGroup.Button>
            <Button>Add Filter</Button>
          </InputGroup.Button>
        </InputGroup>

        <FormControl.Feedback />
      </FormGroup>

      <FormGroup>
        <ControlLabel>Current Filter:</ControlLabel>

        <If condition={filters.length > 0}>
          <Then>
            <InputGroup>
              {filters.map((f, i) => {
                return <Button className="btn-space" onClick={() => this.removeFilter(f)} bsStyle="default" bsSize="xs" key={i}>{f.render()}</Button>;
              })}
            </InputGroup>
          </Then>
          <Else>
            <InputGroup><em>No Filters</em></InputGroup>
          </Else>
        </If>
      </FormGroup>
    </Form>;
  }
}

interface DashboardsProps {
  location: any,
  route: {
    test: string
  }
}

interface DashboardsState {
  dashboards: DashboardEntry[];
  filters: Filter<any>[];
  nextPageToken: string | null;
  limit: number | null;
  pageToken: string | null;
}

export default class Dashboards extends React.PureComponent<DashboardsProps, DashboardsState> {
  context: PagesContext & RouterContext;

  readonly setPageToken: (pageToken: string) => void;
  readonly limit: BoundValidator<number>;

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
      nextPageToken: null,
      limit: validateLimit.parse(query.limit, DEFAULT_LIMIT),
      pageToken: query.pageToken || null
    } as DashboardsState;

    this.setPageToken = nextPageToken => {
      this.setState({ pageToken: nextPageToken, nextPageToken: null }, () => {
        this.updateUrl();
        this.updateDashboards();
      });
    };

    this.limit = validateLimit.bind(() => this.state.limit, {});
  }

  public componentDidMount(): void {
    this.updateDashboards();
  }

  public componentDidUpdate(prevProps: DashboardsProps): void {
    const {query, key} = this.props.location;

    if (prevProps.location.key !== key) {
      const limit = parseInt(query.limit) || null;
      const pageToken = query.pageToken || null;

      this.setState({ limit: limit, pageToken: pageToken }, () => {
        this.updateDashboards();
      });

      return;
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

          <SearchForm
            limit={limit}
            filters={filters}
            onRemoveFilter={f => this.removeFilter(f)}
            onAddFilter={f => this.addFilter(f)}
            onChangeLimit={limit => this.setLimit(limit)} />

          <DashboardList dashboards={dashboards} onAddMetadataFilter={this.addMetadataFilter.bind(this)} />

          <Pager>
            <If condition={pageToken !== null}>
              <Pager.Item previous href="#" onClick={this.reset.bind(this)}>Reset</Pager.Item>
            </If>
            <If condition={nextPageToken !== null}>
              <Pager.Item next href="#" onClick={() => this.setPageToken(nextPageToken)}>Next Page &rarr;</Pager.Item>
            </If>
          </Pager>
        </Col>
      </Row>
    );
  }

  private setLimit(limit: number | null): void {
    this.setState({ limit: limit }, () => {
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
    this.setState({ pageToken: null }, () => {
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
        pageToken: null
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

    nextQuery.limit = this.limit.get().map(value => value.toString()).orElse(query.limit);

    if (pageToken !== null) {
      nextQuery.pageToken = pageToken;
    }

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
    let {pageToken} = this.state as DashboardsState;

    this.limit.get().ifPresent(limit => {
      let p = this.context.db.search(filter, limit, pageToken);

      p.then(page => {
        this.setState({ dashboards: page.results, nextPageToken: page.pageToken });
      }, reason => {
        console.log(reason);
      });
    });
  }
};
