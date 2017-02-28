import React from 'react';
import { BarChart, EditOptions, DataSource } from 'api/model';
import { Form, FormGroup, ControlLabel, FormControl } from 'react-bootstrap';
import { clone } from 'mapping';
import EditDataSource from 'components/EditDataSource';

interface Props {
  barChart: BarChart;
  editOptions: EditOptions<BarChart>;
}

export default class EditBarChart extends React.Component<Props, {}> {
  public render() {
    const { barChart, editOptions } = this.props;

    const options = {
      onChange: (dataSource: DataSource) => {
        editOptions.onChange(clone(barChart, { dataSource: dataSource }))
      }
    };

    return (
      <Form>
        <FormGroup controlId='stacked'>
          <ControlLabel>Stacked:</ControlLabel>
          <FormControl.Static>
            {barChart.stacked ? "yes" : "no"}
          </FormControl.Static>
        </FormGroup>

        <EditDataSource dataSource={barChart.dataSource} editOptions={options} />
      </Form >
    );
  }
};
