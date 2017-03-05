import * as React from 'react';
import { BarChart, EditOptions, DataSource, HasType } from 'api/model';
import { Form, FormGroup, FormControl, ControlLabel } from 'react-bootstrap';
import { clone, mutate } from 'mapping';
import EditDataSource from 'components/EditDataSource';
import EditCanvasChart from 'components/EditCanvasChart';

interface Props {
  barChart: BarChart;
  editOptions: EditOptions<BarChart>;
}

class Extended extends EditCanvasChart<BarChart> {
}

export default class EditBarChart extends React.Component<Props, {}> {
  public render() {
    const { barChart, editOptions } = this.props;

    const options = {
      onChange: (dataSource: DataSource & HasType) => {
        editOptions.onChange(clone(barChart, { dataSource: dataSource }))
      }
    };

    return (
      <Form>
        <Extended canvasChart={barChart} onChange={barChart => {
          editOptions.onChange(barChart);
        }} />

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
