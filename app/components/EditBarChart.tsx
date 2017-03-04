import * as React from 'react';
import { BarChart, EditOptions, DataSource } from 'api/model';
import { Form, FormGroup, Checkbox, FormControl, ControlLabel } from 'react-bootstrap';
import { clone, mutate } from 'mapping';
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
          <Checkbox checked={barChart.stacked} onChange={
            (e: any) => editOptions.onChange(mutate(barChart, { stacked: e.target.checked }))
          }>
            Stacked?
          </Checkbox>
        </FormGroup>

        <FormGroup controlId='gap'>
          <ControlLabel>Gap:</ControlLabel>
          <FormControl type="number" value={barChart.gap} onChange={
            (e: any) => editOptions.onChange(mutate(barChart, { gap: parseInt(e.target.value) }))
          } />
        </FormGroup>

        <EditDataSource dataSource={barChart.dataSource} editOptions={options} />
      </Form >
    );
  }
};
