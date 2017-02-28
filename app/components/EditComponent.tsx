import * as React from 'react';
import { PagesContext } from 'api/interfaces';
import { Component, Visualization } from 'api/model';
import { Row, Col, Grid, Button, Glyphicon, FormGroup, ControlLabel, FormControl } from 'react-bootstrap';
import EditVisualization from './EditVisualization';
import { mutate } from 'mapping';

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
          <Col sm={12}>
            <FormGroup>
              <ControlLabel label="title">Title</ControlLabel>
              <FormControl type="text" value={component.title} onChange={(e: any) => this.mutate({ title: e.target.value })} />
            </FormGroup>
          </Col>
        </Row>

        <EditVisualization visualization={component.visualization} onChange={visualization => this.changeVisualization(visualization)} />

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

  private changeVisualization(visualization: Visualization) {
    this.mutate({ visualization: visualization });
  }

  private back() {
    this.props.onBack(this.state.component);
  }

  private mutate<K extends keyof Component>(mutation: Pick<Component, K>) {
    this.setState((prev, _) => {
      return { component: mutate(prev.component, mutation) };
    });
  }
};
