import * as React from 'react';
import { FormGroup, FormControl, Checkbox, ControlLabel } from 'react-bootstrap';
import { clone } from 'mapping';
import { Model } from './CanvasChart';

interface Props<T extends Model> {
  canvasChart: T;
  onChange: (value: T) => void;
}

export default class EditLineChart<T extends Model> extends React.Component<Props<T>, {}> {
  public render() {
    const { canvasChart, onChange } = this.props;

    return (
      <div>
        <FormGroup controlId='stacked'>
          <FormControl.Static componentClass="div">
            <Checkbox checked={canvasChart.stacked} onChange={
              (e: any) => onChange(clone(canvasChart, { stacked: e.target.checked }))
            }>
              Stacked?
            </Checkbox>
          </FormControl.Static>
        </FormGroup>

        <FormGroup controlId='gridLineSpace'>
          <ControlLabel>
            Grid Line Space:
          </ControlLabel>
          <FormControl type='number' value={canvasChart.gridLineSpace} onChange={
            (e: any) => onChange(clone(canvasChart, { gridLineSpace: e.target.value }))
          } />
        </FormGroup>
      </div >
    );
  }
};
