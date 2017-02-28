import * as React from 'react';
import { PagesContext } from 'api/interfaces';
import * as model from 'api/model';
import { Row, Col } from 'react-bootstrap';
import { Optional, absent, of } from 'optional';

import Visualization from './Visualization';

interface Props {
  visualization: model.VisualizationReference | model.Visualization
}

interface State {
  visualization: Optional<model.Visualization>
}

export default class EditVisualization extends React.Component<Props, State> {
  context: PagesContext;

  public static contextTypes: any = {
    db: React.PropTypes.object
  };

  constructor(props: Props) {
    super(props);

    this.state = {
      visualization: absent<model.Visualization>()
    };
  }

  public componentDidMount() {
    const { visualization } = this.props;

    if (visualization instanceof model.VisualizationReference) {
      this.context.db.getVisualization(visualization.id).then(visualization => {
        this.setState({ visualization: visualization })
      });
    } else {
      this.setState({ visualization: of(visualization) });
    }
  }

  public render() {
    const { visualization } = this.state;

    const chart = visualization.map(v => <Visualization height={200} visualization={v} />).orElseGet(() => <em>No Chart</em>);

    return (
      <div>
        <h4>Editing {visualization.map(v => <span>{v.typeTitle()}</span>).orElse(<em>Unknown</em>)}</h4>

        <Row>
          <Col sm={12}>{chart}</Col>
        </Row>

        {visualization.map(v => v.renderEdit()).get()}
      </div>
    );
  }
};
