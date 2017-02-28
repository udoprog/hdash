import React from 'react';
import { LineChart, EditOptions, DataSource } from 'api/model';
import { Form, FormGroup, ControlLabel, FormControl } from 'react-bootstrap';
import { clone } from 'mapping';
import EditDataSource from 'components/EditDataSource';

interface Props {
  lineChart: LineChart;
  editOptions: EditOptions<LineChart>;
}

export default class EditLineChart extends React.Component<Props, {}> {
  public render() {
    const { lineChart, editOptions } = this.props;

    const options = {
      onChange: (dataSource: DataSource) => {
        editOptions.onChange(clone(lineChart, { dataSource: dataSource }))
      }
    };

    return (
      <Form>
        <FormGroup controlId='stacked'>
          <ControlLabel>Stacked:</ControlLabel>
          <FormControl.Static>
            {lineChart.stacked ? "yes" : "no"}
          </FormControl.Static>
        </FormGroup>

        <EditDataSource dataSource={lineChart.dataSource} editOptions={options} />
      </Form >
    );
  }
};
