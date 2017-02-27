import * as React from 'react';
import { PagesContext } from 'api/interfaces';
import { DataSourceReference, DataSource, DataSourceData } from 'api/model';
import { Row, Col, FormGroup, ControlLabel, FormControl } from 'react-bootstrap';
import { Optional, absent, of } from 'optional';
import { clone } from 'mapping';

interface Props {
  datasource: DataSourceReference | DataSource
}

interface State {
  datasource: Optional<DataSourceData>
}

export default class EditDataSource extends React.Component<Props, State> {
  context: PagesContext;

  public static contextTypes: any = {
    db: React.PropTypes.object
  };

  constructor(props: Props) {
    super(props);

    this.state = {
      datasource: absent<DataSourceData>()
    };
  }

  public componentDidMount() {
    const { datasource } = this.props;

    if (datasource instanceof DataSourceReference) {
      this.context.db.getDataSource(datasource.id).then(datasource => {
        this.setState({ datasource: datasource })
      });
    } else {
      this.setState({ datasource: of(datasource as DataSourceData) });
    }
  }

  public render() {
    const {datasource} = this.state;

    const query = datasource.map(d => d.query).orElse("");

    return (
      <div>
        <Row>
          <Col sm={12}>
            <FormGroup controlId="query">
              <ControlLabel>Query:</ControlLabel>
              <FormControl componentClass="textarea" placeholder="textarea" value={query} onChange={e => this.changeQuery(e)} />
            </FormGroup>
          </Col>
        </Row>
      </div>
    );
  }

  private changeQuery(e: any) {
    const {datasource} = this.state;

    const query = e.value;

    datasource.accept(datasource => {
      this.setState({ datasource: of(clone(datasource, { query: query })) });
    });
  }
};
