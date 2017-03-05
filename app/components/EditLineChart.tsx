import * as React from 'react';
import { LineChart, EditOptions, DataSource, HasType } from 'api/model';
import { FormGroup, FormControl, Checkbox } from 'react-bootstrap';
import { clone, mutate } from 'mapping';
import EditDataSource from 'components/EditDataSource';
import EditCanvasChart from 'components/EditCanvasChart';

interface Props {
  lineChart: LineChart;
  editOptions: EditOptions<LineChart>;
}

class Extended extends EditCanvasChart<LineChart> {
}

export default class EditLineChart extends React.Component<Props, {}> {
  public render() {
    const { lineChart, editOptions } = this.props;

    const options = {
      onChange: (dataSource: DataSource & HasType) => {
        editOptions.onChange(clone(lineChart, { dataSource: dataSource }))
      }
    };

    return (
      <div>
        <Extended canvasChart={lineChart} onChange={lineChart => {
          editOptions.onChange(lineChart);
        }} />

        <FormGroup controlId='zeroBased'>
          <FormControl.Static componentClass="div">
            <Checkbox checked={lineChart.zeroBased} onChange={
              (e: any) => editOptions.onChange(mutate(lineChart, { zeroBased: e.target.checked }))
            }>
              Zero Based?
            </Checkbox>
          </FormControl.Static>
        </FormGroup>

        <EditDataSource dataSource={lineChart.dataSource} editOptions={options} />
      </div >
    );
  }
};
