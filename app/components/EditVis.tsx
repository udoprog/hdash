import * as React from 'react';
import { Vis, HasType, VisComponent, Range, VISUALIZATION_TYPES } from 'api/model';
import { Row, Col, FormGroup, FormControl, ButtonGroup, InputGroup } from 'react-bootstrap';
import { clone } from 'mapping';
import TypeButton from 'components/TypeButton';

interface Props {
  vis: Vis & HasType;
  range: Range;
  onChange: (visualization: Vis & HasType) => void;
}

export default class EditVis extends React.Component<Props, {}> implements VisComponent {
  old: { [key: string]: Vis & HasType };
  visual?: VisComponent;

  constructor(props: Props) {
    super(props);

    this.old = {};
  }

  public componentDidMount() {
    this.visual.refresh(true);
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
                    key={model.type}
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

    const { range } = this.props;

    return (
      <div>
        {typePicker}

        <Row>
          <Col sm={12}>
            {vis.renderVisual({ height: 200, range: range }, visual => this.visual = visual)}
          </Col>
        </Row>

        {vis.renderEdit(onChange)}
      </div>
    );
  }

  public refresh(query?: boolean): Promise<{}> {
    return this.visual.refresh(query);
  }
};
