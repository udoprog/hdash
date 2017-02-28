import React from 'react';
import { VisualizationReference, EditOptions } from 'api/model';
import { Form, FormGroup, ControlLabel, FormControl } from 'react-bootstrap';
import { clone } from 'mapping';

interface Props {
  visualizationReference: VisualizationReference;
  editOptions: EditOptions<VisualizationReference>;
}

export default class EditVisualizationReference extends React.Component<Props, {}> {
  public render() {
    const { visualizationReference } = this.props;

    return (
      <Form>
        <FormGroup controlId='stacked'>
          <ControlLabel>ID:</ControlLabel>
          <FormControl value={visualizationReference.id} onChange={(e: any) => this.changeId(e.target.value)}></FormControl>
        </FormGroup>
      </Form >
    );
  }

  private changeId(id: string) {
    const { visualizationReference, editOptions } = this.props;
    editOptions.onChange(clone(visualizationReference, { id: id }));
  }
};
