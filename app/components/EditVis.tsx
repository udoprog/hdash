import * as React from 'react';
import { Vis, ReferenceVis, LineChart, BarChart, VisComponent, DEFAULT_REFERENCE, DEFAULT_BAR_CHART, DEFAULT_LINE_CHART } from 'api/model';
import { Row, Col, FormGroup, FormControl, ButtonGroup, InputGroup, Button } from 'react-bootstrap';
import { clone } from 'mapping';
import TypeButton from 'components/TypeButton';

interface Props {
  vis: Vis;
  onChange: (visualization: Vis) => void;
}

export default class EditVis extends React.Component<Props, {}> {
  old: { [key: string]: Vis };
  visual?: VisComponent;

  constructor(props: Props) {
    super(props);

    this.old = {};
  }

  public render() {
    const { vis, onChange } = this.props;

    const typePicker = (
      <FormGroup >
        <FormControl.Static componentClass="div">
          <InputGroup>
            <InputGroup.Addon>
              Visualization Type:
            </InputGroup.Addon>
            <ButtonGroup>
              <TypeButton
                style={{ borderRadius: 0 }}
                instance={vis}
                model={ReferenceVis}
                onChangeType={type => this.changeType(type)} />
              <TypeButton
                instance={vis}
                model={LineChart}
                onChangeType={type => this.changeType(type)} />
              <TypeButton
                instance={vis}
                model={BarChart}
                onChangeType={type => this.changeType(type)} />
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
          <Col sm={12}>
            {vis.renderVisual({ height: 200 }, visual => this.visual = visual)}
          </Col>
        </Row>

        {vis.renderEdit(editOptions)}

        <Row>
          <Col sm={12}>
            <Button onClick={() => this.visual && this.visual.requery()}>Requery</Button>
          </Col>
        </Row>
      </div>
    );
  }

  private changeType(type: string) {
    const { onChange, vis } = this.props;

    this.old[vis.type] = vis;

    switch (type) {
      case ReferenceVis.type:
        onChange(clone(this.old[type] || DEFAULT_REFERENCE));
        break;
      case BarChart.type:
        onChange(clone(this.old[type] || DEFAULT_BAR_CHART));
        break;
      case LineChart.type:
        onChange(clone(this.old[type] || DEFAULT_LINE_CHART));
        break;
      default:
        throw new Error("Unsupported type: " + type);
    }
  }
};
