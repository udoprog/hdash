import * as React from 'react';
import {Link} from 'react-router';
import {Row, Col, Label} from 'react-bootstrap';
import {InputGroup, Form, FormGroup, Button, ButtonToolbar, ControlLabel, FormControl} from 'react-bootstrap';
import {Pager} from 'react-bootstrap';
import {If, Then, Else} from 'react-if';

import {PagesContext, RouterContext} from 'interfaces';
import {Filter} from 'interfaces';
import {AndFilter, MetadataFilter, TitleFilter} from '../filter';

import * as shallowEqual from 'shallowequal';

const DEFAULT_LIMIT = 20;

interface DashboardsProps {
  location: any,
  route: {
    test: string
  }
}

export default class Dashboards extends React.PureComponent<DashboardsProps, any> {
  context: PagesContext & RouterContext;

  readonly update: () => void;
  readonly updateWithUrl: () => void;
  readonly setPageToken: (pageToken: string) => void;

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
      addFilterValue: "",
      nextPageToken: null,
      limit: parseInt(query.limit) || null,
      pageToken: query.pageToken || null
    };

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
  }

  public setLimit(limit: number) {
    this.setState({limit: limit}, this.updateWithUrl)
  }

  public removeFilter(filter: Filter<any>) {
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

  private reset(): void {
    this.setState({limit: null, pageToken: null}, this.updateWithUrl);
  }

  private addMetadataFilter(key: string, value: string): void {
    this.addFilter(new MetadataFilter(key, value));
  }

  private addFilterKey(e: any): boolean {
    e.preventDefault();

    if (e.key === 'Enter') {
      return this.addFilterEvent(e);
    }

    return false;
  }

  private addFilter(filter: Filter<any>): boolean {
    this.setState((prev, props) => {
      return {
        filters: prev.filters.concat([filter]),
        showAddTitle: false,
        showAddFilter: false,
        pageToken: null
      }
    }, this.updateWithUrl)

    return false;
  }

  private addFilterEvent(e: any): boolean {
    e.preventDefault();

    const {addFilterValue} = this.state;

    const index = addFilterValue.indexOf(':');

    if (index >= 1) {
      const key = addFilterValue.substring(0, index);
      const value = addFilterValue.substring(index);
      return this.addFilter(new MetadataFilter(key, value));
    } else {
      return this.addFilter(new TitleFilter(addFilterValue));
    }
  }

  private updateUrl(): void {
    const {router} = this.context;
    const {pathname, query} = this.props.location;
    const {limit, pageToken} = this.state;

    let nextQuery: any = {};

    if (limit !== null && limit !== DEFAULT_LIMIT) {
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
    let {limit, pageToken}: {limit: number, pageToken?: string} = this.state;

    limit = limit || DEFAULT_LIMIT;

    let p = this.context.db.search(filter, limit, pageToken);

    p.then(page => {
      this.setState({dashboards: page.results, nextPageToken: page.pageToken});
    }, reason => {
      console.log(reason);
    });
  }

  public render(): JSX.Element {
    const {
      addFilterValue,
      showAddFilter,
      addTitleValue,
      showAddTitle,
      limit,
      filters,
      pageToken,
      nextPageToken,
    }: {
      addFilterValue: string,
      showAddFilter: boolean,
      addTitleValue: string,
      showAddTitle: boolean,
      limit: number,
      filters: Filter<any>[],
      nextPageToken: string,
      pageToken: string,
    } = this.state;

    return (
      <Row>
        <Col sm={6}>
          <h4>Favorites</h4>
        </Col>

        <Col sm={6}>
          <h4>Search</h4>

          <Form onSubmit={this.addFilterEvent.bind(this)}>
            <FormGroup controlId="formLimit">
              <ControlLabel>Limit:</ControlLabel>

              <FormControl
                type="number"
                value={limit || DEFAULT_LIMIT}
                onChange={(e: any) => this.setLimit(e.target.value)}
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
                  onChange={(e: any) => this.setState({addFilterValue: e.target.value})} />

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
          </Form>

          <div>
          {this.state.dashboards.map((d, i) => {
            return (
              <div key={i}>
                <Link to={`/dashboard/${d.id}`}>{d.title}</Link>

                <div>
                  {Object.keys(d.metadata).map(k => {
                    const v = d.metadata[k];
                    return <Button onClick={() => this.addMetadataFilter(k, v)} bsStyle="primary" bsSize="xs" key={i}>
                      {k}:{v}
                    </Button>;
                  })}
                </div>
              </div>
            );
          })}
          </div>

          <Pager>
            <If condition={pageToken !== null || limit != null}>
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
};
