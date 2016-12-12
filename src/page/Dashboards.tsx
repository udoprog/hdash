import * as React from 'react';
import {Link} from 'react-router';
import {Row, Col, Label} from 'react-bootstrap';
import {InputGroup, Form, FormGroup, Button, ButtonToolbar, ControlLabel, FormControl} from 'react-bootstrap';
import {Pager} from 'react-bootstrap';
import {If, Then, Else} from 'react-if';

import {PagesContext, RouterContext} from 'interfaces';
import {Filter} from 'interfaces';
import {DashboardEntry} from 'interfaces';
import {AndFilter, MetadataFilter, TitleFilter} from '../filter';
import {validator, BoundValidator, validators} from '../forms';

import * as shallowEqual from 'shallowequal';

const DEFAULT_LIMIT = 20;

const validateLimit = validators.integer({
  checks: validators.min(1)
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

  constructor(props) {
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
      const value = addFilterValue.substring(index);
      this.props.onAddFilter(new MetadataFilter(key, value));
    } else {
      this.props.onAddFilter(new TitleFilter(addFilterValue));
    }

    return false;
  }

  public render() {
    const {addFilterValue} = this.state as SearchFormState;
    const {limit, filters, onChangeLimit} = this.props;

    return <Form onSubmit={this.addFilterEvent.bind(this)}>
      {JSON.stringify(this.limit.$errors)}

      <FormGroup controlId="formLimit">
        <ControlLabel>Limit:</ControlLabel>

        <FormControl
          type="number"
          value={this.limit.value()}
          onChange={this.limit.onChange}
          componentClass="input"
          placeholder="select">
        </FormControl>
      </FormGroup>

      <FormGroup controlId="formAddFilter">
        <ControlLabel>Add Filter:</ControlLabel>

        <InputGroup>
          <FormControl
            type="text"
            value={addFilterValue}
            placeholder="Enter Filter"
            onKeyUp={this.addFilterKey.bind(this)}
            onChange={(e: any) => this.setState({addFilterValue: e.target.value as string})} />

          <InputGroup.Button>
            <Button>Add Filter</Button>
          </InputGroup.Button>
        </InputGroup>
      </FormGroup>

      <FormGroup>
        <ControlLabel>Current Filter:</ControlLabel>

        <If condition={filters.length > 0}>
          <Then>
            <InputGroup>
              {filters.map((f, i) => {
                return <Button onClick={() => this.removeFilter(f)} bsStyle="primary" bsSize="xs" key={i}>{f.render()}</Button>;
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

export default class Dashboards extends React.PureComponent<DashboardsProps, DashboardsState | any> {
  context: PagesContext & RouterContext;

  readonly update: () => void;
  readonly updateWithUrl: () => void;
  readonly setPageToken: (pageToken: string) => void;
  readonly limit: BoundValidator<number>;

  public static contextTypes: any = {
    db: React.PropTypes.object,
    router: React.PropTypes.any
  };

  constructor(props) {
    super(props);

    const {query} = props.location;

    this.state = {
      dashboards: [],
      filters: [],
      nextPageToken: null,
      limit: validateLimit.parse(query.limit, DEFAULT_LIMIT),
      pageToken: query.pageToken || null
    } as DashboardsState;

    this.updateWithUrl = () => {
      this.updateUrl();
      this.update();
    };

    this.update = () => {
      this.updateDashboards();
    };

    this.setPageToken = nextPageToken => {
      const {pageToken} = this.state;
      this.setState({pageToken: nextPageToken, nextPageToken: null}, this.updateWithUrl);
    };

    this.limit = validateLimit.bind(() => this.state.limit, {});
  }

  public componentDidMount(): void {
    this.update();
  }

  public componentDidUpdate(prevProps: DashboardsProps, prevState: any): void {
    const {query, key} = this.props.location;

    if (prevProps.location.key !== key) {
      const limit = parseInt(query.limit) || null;
      const pageToken = query.pageToken || null;

      this.setState({limit: limit, pageToken: pageToken}, this.update);
      return;
    }
  }

  public render() {
    const {limit, filters, pageToken, nextPageToken} = this.state;
    const {dashboards} = this.state;

    return (
      <Row>
        <Col sm={6}>
          <h4>Favorites</h4>
        </Col>

        <Col sm={6}>
          <h4>Search</h4>

          <SearchForm
            limit={limit}
            filters={filters}
            onRemoveFilter={this.removeFilter.bind(this)}
            onAddFilter={this.addFilter.bind(this)}
            onChangeLimit={this.setLimit.bind(this)} />

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
    this.setState({limit: limit}, this.updateWithUrl)
  }

  private removeFilter(filter: Filter<any>): void {
    this.setState((prev, props) => {
      let data = [].concat(prev.filters);
      let index = data.indexOf(filter);

      if (index < 0) {
        return prev;
      }

      data.splice(index, 1);
      return {filters: data};
    }, this.updateWithUrl)
  }

  private reset(): void {
    this.setState({pageToken: null}, this.updateWithUrl);
  }

  private addMetadataFilter(key: string, value: string): void {
    this.addFilter(new MetadataFilter(key, value));
  }

  private addFilter(filter: Filter<any>): boolean {
    this.setState((prev, props) => {
      return {
        filters: prev.filters.concat([filter]),
        pageToken: null
      }
    }, this.updateWithUrl)

    return false;
  }

  private updateUrl(): void {
    const {router} = this.context;
    const {pathname, query} = this.props.location;
    const {limit, pageToken} = this.state;

    let nextQuery: any = {};

    if (limit !== null && limit > 0) {
      nextQuery.limit = limit.toString();
    }

    if (pageToken !== null) {
      nextQuery.pageToken = pageToken;
    }

    if (!shallowEqual(query, nextQuery)) {
      this.context.router.push({
        pathname: pathname,
        query: nextQuery
      });
    }
  }

  private updateDashboards(): void {
    let filter = new AndFilter(this.state.filters);
    let {pageToken} = this.state as DashboardsState;

    this.limit.ifValid(limit => {
      let p = this.context.db.search(filter, limit, pageToken);

      p.then(page => {
        this.setState({dashboards: page.results, nextPageToken: page.pageToken});
      }, reason => {
        console.log(reason);
      });
    });
  }
};
