import * as React from 'react';
import { FormGroup, FormControl, ButtonGroup, InputGroup } from 'react-bootstrap';
import { DataSource, EditOptions, DATA_SOURCE_TYPES } from 'api/model';
import { clone } from 'mapping';
import TypeButton from 'components/TypeButton';

interface Props {
  dataSource: DataSource;
  editOptions: EditOptions<DataSource>;
}

export default class EditDataSource extends React.Component<Props, {}> {
  old: { [key: string]: DataSource };

  constructor(props: Props) {
    super(props);

    this.old = {};
  }

  public render() {
    const { dataSource, editOptions } = this.props;

    const typePicker = (
      <FormGroup >
        <FormControl.Static componentClass="div">
          <InputGroup>
            <InputGroup.Addon>
              Data Source Type:
            </InputGroup.Addon>
            <ButtonGroup>
              {DATA_SOURCE_TYPES.map(([model, defaultInstance], index) => {
                const onChange = () => {
                  // remember old if coming back later
                  this.old[dataSource.type] = clone(dataSource);
                  editOptions.onChange(clone(this.old[model.type] || defaultInstance));
                }

                return (
                  <TypeButton
                    style={{ borderRadius: index === 0 ? 1 : null }}
                    instance={dataSource}
                    model={model}
                    onChangeType={onChange} />
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
        {dataSource.renderEdit(editOptions)}
      </div>
    );
  }
};
