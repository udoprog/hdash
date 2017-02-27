import * as React from 'react';
import { PagesContext } from 'api/interfaces';
import { VisualizationReference, Visualization } from 'api/model';
import { Row, Col, FormGroup, ControlLabel, FormControl } from 'react-bootstrap';
import { Optional, absent } from 'optional';
import EditDataSource from './EditDataSource';

interface Props {
  visualization: VisualizationReference | Visualization
}

interface State {
  visualization: Optional<Visualization>
}

export default class EditVisualization extends React.Component<Props, State> {
  context: PagesContext;

  public static contextTypes: any = {
    db: React.PropTypes.object
  };

  constructor(props: Props) {
    super(props);

    this.state = {
      visualization: absent<Visualization>()
    };
  }

  public componentDidMount() {
    const { visualization } = this.props;

    if (visualization instanceof VisualizationReference) {
      this.context.db.getVisualization(visualization.id).then(visualization => {
        this.setState({ visualization: visualization })
      });
    }
  }

  public render() {
    const {visualization} = this.state;

    const datasource = visualization.map(v => <EditDataSource datasource={v.datasource} />).get();

    return (
      <div>
        {datasource}

        <Row>
          <Col sm={12}>
            <FormGroup>
              <ControlLabel label="title">Title</ControlLabel>
              <FormControl type="text" value="cool beans" readOnly />
            </FormGroup>
          </Col>
        </Row>
      </div>
    );
  }
};
