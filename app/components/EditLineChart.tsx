import React from 'react';
import { LineChart, EditOptions } from 'api/model';
import { Form, FormGroup, ControlLabel, FormControl } from 'react-bootstrap';
import EditDataSource from 'components/EditDataSource';

interface Props {
  lineChart: LineChart;
  editOptions: EditOptions<LineChart>;
}

interface State {
  lineChart: LineChart;
}

export default class EditLineChart extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      lineChart: props.lineChart
    };
  }

  public render() {
    const { lineChart } = this.state;

    return (
      <Form>
        <FormGroup controlId='stacked'>
          <ControlLabel>Stacked:</ControlLabel>
          <FormControl.Static>
            {lineChart.stacked ? "yes" : "no"}
          </FormControl.Static>
        </FormGroup>

        <EditDataSource datasource={lineChart.datasource} />
      </Form >
    );
  }
};
