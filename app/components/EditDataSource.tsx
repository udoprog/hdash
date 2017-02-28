import * as React from 'react';
import { FormGroup, FormControl, ButtonGroup, Button, InputGroup } from 'react-bootstrap';
import { DataSource, ReferenceDataSource, EmbeddedDataSource, EditOptions } from 'api/model';
import { decode } from 'mapping';

interface Props {
  dataSource: DataSource;
  editOptions: EditOptions<DataSource>;
}

export default class EditDataSource extends React.Component<Props, {}> {
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
              <Button
                style={{ "border-radius": 0 }}
                active={dataSource.type === EmbeddedDataSource.type}
                onClick={() => this.changeType(EmbeddedDataSource.type)}
              >
                Embedded
              </Button>
              <Button
                active={dataSource.type === ReferenceDataSource.type}
                onClick={() => this.changeType(ReferenceDataSource.type)}
              >
                Reference
              </Button>
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
    const { editOptions } = this.props;

    switch (type) {
      case EmbeddedDataSource.type:
        editOptions.onChange(decode({ query: "" }, EmbeddedDataSource));
        break;
      case ReferenceDataSource.type:
        editOptions.onChange(decode({ id: "" }, ReferenceDataSource));
        break;
      default:
        throw new Error("Unsupported type: " + type);
    }
  }
};
