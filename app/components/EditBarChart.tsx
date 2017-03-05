import * as React from 'react';
import { BarChart, DataSource, HasType } from 'api/model';
import { Form, FormGroup, FormControl, ControlLabel } from 'react-bootstrap';
import { clone, mutate } from 'mapping';
import EditDataSource from 'components/EditDataSource';
import EditCanvasChart from 'components/EditCanvasChart';

interface Props {
  barChart: BarChart;
  onChange: (model: BarChart) => void;
}

class Extended extends EditCanvasChart<BarChart> {
}

export default class EditBarChart extends React.Component<Props, {}> {
  public render() {
    const { barChart, onChange } = this.props;

    const onInnerChange = (dataSource: DataSource & HasType) => {
      onChange(clone(barChart, { dataSource: dataSource }));
    };

    return (
      <Form>
        <Extended canvasChart={barChart} onChange={onChange} />

        <FormGroup controlId='gap'>
          <ControlLabel>Gap:</ControlLabel>
          <FormControl type="number" value={barChart.gap} onChange={
            (e: any) => onChange(mutate(barChart, { gap: parseInt(e.target.value) }))
          } />
        </FormGroup>

        <EditDataSource dataSource={barChart.dataSource} onChange={onInnerChange} />
      </Form >
    );
  }
};
