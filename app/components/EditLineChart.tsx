import * as React from 'react';
import { LineChart } from 'api/model';
import { FormGroup, FormControl, Checkbox } from 'react-bootstrap';
import { clone, mutate } from 'mapping';
import EditDataSource from 'components/EditDataSource';
import EditCanvasChart from 'components/EditCanvasChart';

interface Props {
  lineChart: LineChart;
  onChange: (model: LineChart) => void;
}

class Extended extends EditCanvasChart<LineChart> {
}

export default class EditLineChart extends React.Component<Props, {}> {
  public render() {
    const { lineChart, onChange } = this.props;

    return (
      <div>
        <Extended canvasChart={lineChart} onChange={lineChart => {
          onChange(lineChart);
        }} />

        <FormGroup controlId='zeroBased'>
          <FormControl.Static componentClass="div">
            <Checkbox checked={lineChart.zeroBased} onChange={
              (e: any) => onChange(mutate(lineChart, { zeroBased: e.target.checked }))
            }>
              Zero Based?
            </Checkbox>
          </FormControl.Static>
        </FormGroup>

        <EditDataSource dataSource={lineChart.dataSource} onChange={dataSource => {
          onChange(clone(lineChart, { dataSource: dataSource }));
        }} />
      </div >
    );
  }
};
