import * as React from 'react';
import { PagesContext } from 'api/interfaces';
import { Component, Vis, HasType, Range, VisComponent } from 'api/model';
import { Row, Col, Grid, Button, FormGroup, ControlLabel, FormControl } from 'react-bootstrap';
import EditVis from './EditVis';
import { mutate } from 'mapping';
import FontAwesome from 'react-fontawesome';

interface Props {
  component: Component;
  range: Range;
  onBack: (component: Component) => void;
}

interface State {
  component: Component;
}

export default class EditComponent extends React.Component<Props, State> implements VisComponent {
  context: PagesContext;
  visual?: VisComponent;

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
    const { range } = this.props;

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

        <EditVis
          vis={component.visualization}
          range={range}
          onChange={visualization => this.changeVisualization(visualization)}
          ref={visual => this.visual = visual} />

        <Row>
          <Col sm={12}>
            <Button bsStyle="primary" onClick={() => this.back()}>
              <FontAwesome name="arrow-left" />
              <span className='icon-text'>Back</span>
            </Button>

            <Button onClick={() => this.visual && this.visual.refresh(true)}>
              <FontAwesome name='play' />
              <span className='icon-text'>Query</span>
            </Button>
          </Col>
        </Row>
      </Grid>
    );
  }

  public refresh(query?: boolean): Promise<void> {
    return this.visual.refresh(query);
  }

  private changeVisualization(visualization: Vis & HasType) {
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
