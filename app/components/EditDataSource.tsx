import * as React from 'react';
import { FormGroup, FormControl, ButtonGroup, InputGroup } from 'react-bootstrap';
import { DataSource, HasType, DATA_SOURCE_TYPES } from 'api/model';
import { clone } from 'mapping';
import TypeButton from 'components/TypeButton';

interface Props {
  dataSource: DataSource & HasType;
  onChange: (model: DataSource & HasType) => void;
}

export default class EditDataSource extends React.Component<Props, {}> {
  old: { [key: string]: DataSource & HasType };

  constructor(props: Props) {
    super(props);

    this.old = {};
  }

  public render() {
    const { dataSource, onChange } = this.props;

    const typePicker = (
      <FormGroup >
        <FormControl.Static componentClass="div">
          <InputGroup>
            <InputGroup.Addon>
              Data Source Type:
            </InputGroup.Addon>
            <ButtonGroup>
              {DATA_SOURCE_TYPES.map(([model, defaultInstance], index) => {
                const onChangeType = () => {
                  // remember old if coming back later
                  this.old[dataSource.type] = clone(dataSource);
                  onChange(clone(this.old[model.type] || defaultInstance));
                }

                return (
                  <TypeButton
                    key={model.type}
                    style={{ borderRadius: index === 0 ? 1 : null }}
                    instance={dataSource}
                    model={model}
                    onChangeType={onChangeType} />
                );
              })}
            </ButtonGroup>
          </InputGroup>
        </FormControl.Static>
      </FormGroup >
    );

    return (
      <div>
        {typePicker}
        {dataSource.renderEdit(onChange)}
      </div>
    );
  }
};
