import React from 'react';
import { BarChart } from 'api/model';
import { Form, FormGroup, ControlLabel, FormControl } from 'react-bootstrap';

interface Props {
  barChart: BarChart;
}

export default class EditBarChart extends React.Component<Props, {}> {
  public render() {
    const { barChart } = this.props;

    return (
      <Form>
        <FormGroup controlId='stacked'>
          <ControlLabel>Stacked:</ControlLabel>
          <FormControl.Static>
            {barChart.stacked ? "yes" : "no"}
          </FormControl.Static>
        </FormGroup>
      </Form >
    );
  }
};
