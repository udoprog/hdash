import * as React from 'react';
import { LineChart, EditOptions, DataSource } from 'api/model';
import { Form, FormGroup, FormControl, Checkbox } from 'react-bootstrap';
import { clone, mutate } from 'mapping';
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
          <FormControl.Static componentClass="div">
            <Checkbox checked={lineChart.stacked} onChange={
              (e: any) => editOptions.onChange(mutate(lineChart, { stacked: e.target.checked }))
            }>
              Stacked?
            </Checkbox>

            <Checkbox checked={lineChart.zeroBased} onChange={
              (e: any) => editOptions.onChange(mutate(lineChart, { zeroBased: e.target.checked }))
            }>
              Zero Based?
            </Checkbox>
          </FormControl.Static>
        </FormGroup>

        <EditDataSource dataSource={lineChart.dataSource} editOptions={options} />
      </Form >
    );
  }
};
