import * as React from 'react';
import {Link} from 'react-router';
import {Row, Col, Label, Form, FormGroup, Button, ButtonToolbar, ControlLabel, FormControl} from 'react-bootstrap';

import {PagesContext} from 'interfaces';
import {Filter} from 'interfaces';
import {MetadataFilter, TitleFilter} from '../filter';
import {If, Then, Else} from 'react-if';

interface DashboardsProps {
  route: {
    test: string
  }
}

export default class Dashboards extends React.Component<DashboardsProps, any> {
  context: PagesContext;

  public static contextTypes: any = {
    db: React.PropTypes.object
  };

  constructor(props) {
    super(props);

    this.state = {
      dashboards: [],
      filters: [],
      showAddMetadata: false,
      addMetadataValue: "",
      showAddTitle: false,
      addTitleValue: ""
    };
  }

  public addMetadataFilter(e) {
    e.preventDefault();

    const {addMetadataValue} = this.state;
    const [key, value, ...rest] = addMetadataValue.split(':');

    this.setState((prev, props) => {
      return {
        filters: prev.filters.concat([new MetadataFilter(key, value)]),
        showAddMetadata: false
      }
    })

    return false;
  }

  public removeFilter(filter: Filter) {
    this.setState((prev, props) => {
      let data = [].concat(prev.filters);
      let index = data.indexOf(filter);

      if (index < 0) {
        return prev;
      }

      data.splice(index, 1);
      return {filters: data};
    })
  }

  public addTitleFilter(e) {
    e.preventDefault();

    const {addTitleValue} = this.state;

    this.setState((prev, props) => {
      return {
        filters: prev.filters.concat([new TitleFilter(addTitleValue)]),
        showAddTitle: false
      }
    })

    return false;
  }

  public componentDidMount(): void {
    this.context.db.search().then(result => {
      this.setState({dashboards: result});
    }, reason => {
      console.log(reason);
    });
  }

  public render(): JSX.Element {
    const {
      addMetadataValue,
      showAddMetadata,
      addTitleValue,
      showAddTitle,
      filters
    }: {
      addMetadataValue: string,
      showAddMetadata: boolean,
      addTitleValue: string,
      showAddTitle: boolean,
      filters: Filter[]
    } = this.state;

    return (
      <Row>
        <Col sm={12}>
          <h1>Dashboards</h1>

          {filters.map((f, i) => {
            return <Button onClick={() => this.removeFilter(f)} bsStyle="primary" bsSize="xs" key={i}>{f.render()}</Button>;
          })}

          <If condition={!showAddMetadata && !showAddTitle}>
            <div>
              <Button onClick={() => this.setState({showAddMetadata: true})}>Add Filter</Button>
              <Button onClick={() => this.setState({showAddTitle: true})}>Add Title Filter</Button>
            </div>
          </If>

          <If condition={showAddMetadata}>
            <Form onSubmit={this.addMetadataFilter.bind(this)}>
              <FormGroup controlId="formAddMetadataFilter">
                <ControlLabel>Add Metadata Filter:</ControlLabel>

                <FormControl
                  type="text"
                  value={addMetadataValue}
                  placeholder="Enter Filter"
                  onChange={(e: any) => this.setState({addMetadataValue: e.target.value})} />
              </FormGroup>
            </Form>
          </If>

          <If condition={showAddTitle}>
            <Form onSubmit={this.addTitleFilter.bind(this)}>
              <FormGroup controlId="formAddTitleFilter">
                <ControlLabel>Add Title Filter:</ControlLabel>

                <FormControl
                  type="text"
                  value={addTitleValue}
                  placeholder="Enter Title"
                  onChange={(e: any) => this.setState({addTitleValue: e.target.value})} />
              </FormGroup>
            </Form>
          </If>

          {this.state.dashboards.map((d, i) => {
            return <p key={i}><Link to={`/dashboard/${d.id}`}>{d.title}</Link></p>;
          })}
        </Col>
      </Row>
    );
  }
};
