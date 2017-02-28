import * as React from 'react';
import { Visualization, ReferenceVisualization, LineChart, BarChart, DEFAULT_REFERENCE, DEFAULT_BAR_CHART, DEFAULT_LINE_CHART } from 'api/model';
import { Row, Col, FormGroup, FormControl, ButtonGroup, Button, InputGroup } from 'react-bootstrap';
import { clone } from 'mapping';

interface Props {
  visualization: Visualization;
  onChange: (visualization: Visualization) => void;
}

export default class EditVisualization extends React.Component<Props, {}> {
  public render() {
    const { visualization, onChange } = this.props;

    const typePicker = (
      <FormGroup >
        <FormControl.Static componentClass="div">
          <InputGroup>
            <InputGroup.Addon>
              Visualization Type:
            </InputGroup.Addon>
            <ButtonGroup>
              <Button
                style={{ "border-radius": 0 }}
                active={visualization.type === ReferenceVisualization.type}
                onClick={() => this.changeType(ReferenceVisualization.type)}
              >
                Reference
              </Button>
              <Button
                active={visualization.type === LineChart.type}
                onClick={() => this.changeType(LineChart.type)}
              >
                Line Chart
              </Button>
              <Button
                active={visualization.type === BarChart.type}
                onClick={() => this.changeType(BarChart.type)}
              >
                Bar Chart
              </Button>
            </ButtonGroup>
          </InputGroup>
        </FormControl.Static>
      </FormGroup >
    );

    const editOptions = { onChange: onChange };

    return (
      <div>
        {typePicker}

        <Row>
          <Col sm={12}>{visualization.renderVisual({ height: 200 })}</Col>
        </Row>

        {visualization.renderEdit(editOptions)}
      </div>
    );
  }

  private changeType(type: string) {
    const { onChange } = this.props;

    switch (type) {
      case ReferenceVisualization.type:
        onChange(clone(DEFAULT_REFERENCE));
        break;
      case BarChart.type:
        onChange(clone(DEFAULT_BAR_CHART));
        break;
      case LineChart.type:
        onChange(clone(DEFAULT_LINE_CHART));
        break;
      default:
        throw new Error("Unsupported type: " + type);
    }
  }
};
