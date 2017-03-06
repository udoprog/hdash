import * as React from 'react';
import { PagesContext } from 'api/interfaces';
import { Component, Vis, HasType, Range, VisComponent } from 'api/model';
import { Grid, Button, FormGroup, ControlLabel, FormControl } from 'react-bootstrap';
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
        <FormGroup>
          <ControlLabel label="title">Title</ControlLabel>
          <FormControl type="text" value={component.title} onChange={(e: any) => this.mutate({ title: e.target.value })} />
        </FormGroup>

        <EditVis
          vis={component.visualization}
          range={range}
          onChange={visualization => this.changeVisualization(visualization)}
          ref={visual => this.visual = visual} />

        <Button bsStyle="primary" onClick={() => this.back()}>
          <FontAwesome name="arrow-left" />
          <span className='icon-text'>Back</span>
        </Button>

        <Button onClick={() => this.refresh(true)}>
          <FontAwesome name='play' />
          <span className='icon-text'>Query</span>
        </Button>
      </Grid>
    );
  }

  public refresh(query?: boolean): Promise<void> {
    if (!this.visual) {
      return Promise.resolve();
    }

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
