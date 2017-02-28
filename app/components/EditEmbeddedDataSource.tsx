import React from 'react';
import { EmbeddedDataSource, EditOptions } from 'api/model';
import { Row, Col, FormGroup, ControlLabel, FormControl } from 'react-bootstrap';
import { clone } from 'mapping';

interface Props {
  dataSource: EmbeddedDataSource;
  editOptions: EditOptions<EmbeddedDataSource>;
}

export default class EditEmbeddedDataSource extends React.Component<Props, {}> {
  public render() {
    const { dataSource } = this.props;

    return (
      <div>
        <Row>
          <Col sm={12}>
            <FormGroup controlId="query">
              <ControlLabel>Query:</ControlLabel>
              <FormControl
                componentClass="textarea"
                placeholder="average by host"
                value={dataSource.query}
                onChange={(e: any) => this.changeQuery(e.target.value)} />
            </FormGroup>
          </Col>
        </Row>
      </div>
    );
  }

  private changeQuery(query: string) {
    const {dataSource, editOptions} = this.props;
    editOptions.onChange(clone(dataSource, { query: query }));
  }
};