import * as React from 'react';
import { Vis, VisComponent, VISUALIZATION_TYPES } from 'api/model';
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
              {VISUALIZATION_TYPES.map(([model, defaultInstance], index) => {
                const onChange = () => {
                  const { onChange } = this.props;
                  // remember old if coming back later
                  this.old[vis.type] = clone(vis);
                  onChange(clone(this.old[model.type] || defaultInstance));
                }

                return (
                  <TypeButton
                    style={{ borderRadius: index === 0 ? 1 : null }}
                    instance={vis}
                    model={model}
                    onChangeType={onChange} />
                );
              })}
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
};
