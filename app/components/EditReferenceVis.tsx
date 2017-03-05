import * as React from 'react';
import { ReferenceVis } from 'api/model';
import { Form, FormGroup, ControlLabel, FormControl } from 'react-bootstrap';
import { clone } from 'mapping';

interface Props {
  vis: ReferenceVis;
  onChange: (model: ReferenceVis) => void;
}

export default class EditReferenceVis extends React.Component<Props, {}> {
  public render() {
    const { vis } = this.props;

    return (
      <Form>
        <FormGroup controlId='stacked'>
          <ControlLabel>ID:</ControlLabel>
          <FormControl value={vis.id} onChange={(e: any) => this.changeId(e.target.value)}></FormControl>
        </FormGroup>
      </Form >
    );
  }

  private changeId(id: string) {
    const { vis, onChange } = this.props;
    onChange(clone(vis, { id: id }));
  }
};
