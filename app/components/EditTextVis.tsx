import * as React from 'react';
import { TextVis } from 'api/model';
import { FormGroup, FormControl, ControlLabel } from 'react-bootstrap';
import { clone } from 'mapping';

interface Props {
  textVis: TextVis;
  onChange: (model: TextVis) => void;
}

export default class EditTextVis extends React.Component<Props, {}> {
  public render() {
    const { textVis, onChange } = this.props;

    return (
      <div>
        <FormGroup controlId='gap'>
          <ControlLabel>Content:</ControlLabel>
          <FormControl componentClass='textarea' value={textVis.content} onChange={
            (e: any) => onChange(clone(textVis, { content: e.target.value }))
          } />
        </FormGroup>
      </div>
    );
  }
};
