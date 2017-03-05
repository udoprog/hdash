import * as React from 'react';
import { ReferenceDataSource } from 'api/model';
import { Row, Col, FormGroup, ControlLabel, FormControl } from 'react-bootstrap';
import { clone } from 'mapping';

interface Props {
  dataSource: ReferenceDataSource;
  onChange: (model: ReferenceDataSource) => void;
}

export default class EditReferenceDataSource extends React.Component<Props, {}> {
  public render() {
    const { dataSource } = this.props;

    return (
      <div>
        <Row>
          <Col sm={12}>
            <FormGroup controlId="query">
              <ControlLabel>ID:</ControlLabel>
              <FormControl type="text" value={dataSource.id} onChange={(e: any) => this.changeId(e.target.value)} />
            </FormGroup>
          </Col>
        </Row>
      </div>
    );
  }

  private changeId(id: string) {
    const { dataSource, onChange } = this.props;
    onChange(clone(dataSource, { id: id }));
  }
};
