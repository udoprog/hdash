import * as React from 'react';
import { PagesContext } from 'api/interfaces';
import { Component } from 'api/model';
import { Row, Col, Grid, Button, Glyphicon, FormGroup, ControlLabel, FormControl, Checkbox } from 'react-bootstrap';
import EditVisualization from './EditVisualization';
import { mutate } from 'mapping';
import EditDataSource from './EditDataSource';

interface Props {
  component: Component;
  onBack: (component: Component) => void;
}

interface State {
  component: Component;
}

export default class EditComponent extends React.Component<Props, State> {
  context: PagesContext;

  public static contextTypes: any = {
    db: React.PropTypes.object
  };

  constructor(props: Props) {
    super(props);

    this.state = {
      component: props.component
    }
  }

  public render() {
    const { component } = this.state;

    return (
      <Grid>
        <Row>
          <Col sm={10}>
            <FormGroup>
              <ControlLabel label="title">Title</ControlLabel>
              <FormControl type="text" disabled={!component.showTitle} value={component.title} onChange={(e: any) => this.mutate({ title: e.target.value })} />
            </FormGroup>
          </Col>

          <Col sm={2}>
            <ControlLabel label="title"></ControlLabel>
            <Checkbox checked={component.showTitle} onChange={(e: any) => this.mutate({ showTitle: e.target.checked })}>
              Show Title
            </Checkbox>
          </Col>
        </Row>

        <EditVisualization visualization={component.visualization} />

        <EditDataSource datasource={component.datasource} />

        <Row>
          <Col sm={12}>
            <Button bsStyle="primary" onClick={() => this.back()}>
              <Glyphicon glyph="arrow-left" />
              <span>&nbsp;&nbsp;Back</span>
            </Button>
          </Col>
        </Row>
      </Grid>
    );
  }

  private back() {
    this.props.onBack(this.state.component);
  }

  private mutate<K extends keyof Component>(mutation: Pick<Component, K>) {
    this.setState((prev, _) => ({ component: mutate(prev.component, mutation) }));
  }
};
