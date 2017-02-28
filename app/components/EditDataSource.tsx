import * as React from 'react';
import { FormGroup, FormControl, ButtonGroup, InputGroup } from 'react-bootstrap';
import {
  DataSource,
  ReferenceDataSource,
  EmbeddedDataSource,
  EditOptions,
  DEFAULT_EMBEDDED_DATA_SOURCE,
  DEFAULT_REFERENCE_DATA_SOURCE
} from 'api/model';
import { decode } from 'mapping';
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
              <TypeButton
                style={{ borderRadius: 0 }}
                instance={dataSource}
                model={EmbeddedDataSource}
                onChangeType={type => this.changeType(type)} />
              <TypeButton
                instance={dataSource}
                model={ReferenceDataSource}
                onChangeType={type => this.changeType(type)} />
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

  private changeType(type: string) {
    const { editOptions, dataSource } = this.props;

    this.old[dataSource.type] = dataSource;

    switch (type) {
      case EmbeddedDataSource.type:
        editOptions.onChange(decode(this.old[type] || DEFAULT_EMBEDDED_DATA_SOURCE, EmbeddedDataSource));
        break;
      case ReferenceDataSource.type:
        editOptions.onChange(decode(this.old[type] || DEFAULT_REFERENCE_DATA_SOURCE, ReferenceDataSource));
        break;
      default:
        throw new Error("Unsupported type: " + type);
    }
  }
};
