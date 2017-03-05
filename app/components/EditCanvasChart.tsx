import * as React from 'react';
import { Row, Col, FormGroup, FormControl, Checkbox, ControlLabel } from 'react-bootstrap';
import { clone } from 'mapping';
import { CanvasChartModel } from 'components/CanvasChart';

interface Props<T extends CanvasChartModel> {
  canvasChart: T;
  onChange: (value: T) => void;
}

export default class EditLineChart<T extends CanvasChartModel> extends React.Component<Props<T>, {}> {
  public render() {
    const { canvasChart, onChange } = this.props;

    return (
      <Row>
        <Col sm={4}>
          <FormGroup controlId='stacked'>
            <ControlLabel>Options:</ControlLabel>
            <FormControl.Static componentClass="div">
              <Checkbox checked={canvasChart.stacked} onChange={
                (e: any) => onChange(clone(canvasChart, { stacked: e.target.checked }))
              }>Stacked?</Checkbox>
            </FormControl.Static>
          </FormGroup>
        </Col>

        <Col sm={4}>
          <FormGroup controlId='gridLineSpace'>
            <ControlLabel>Grid Line Space:</ControlLabel>
            <FormControl type='number' value={canvasChart.gridLineSpace} onChange={
              (e: any) => onChange(clone(canvasChart, { gridLineSpace: parseInt(e.target.value) }))
            } />
          </FormGroup>
        </Col>

        <Col sm={4}>
          <FormGroup controlId='ticksGoal'>
            <ControlLabel>Ticks:</ControlLabel>
            <FormControl type='number' value={canvasChart.ticksGoal} onChange={
              (e: any) => onChange(clone(canvasChart, { ticksGoal: parseInt(e.target.value) }))
            } />
          </FormGroup>
        </Col>
      </Row>
    );
  }
};
