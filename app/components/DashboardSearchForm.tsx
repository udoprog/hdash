import React from 'react';
import { InputGroup, Form, FormGroup, Button, ControlLabel, FormControl } from 'react-bootstrap';
import { MetadataFilter, TitleFilter, Filter } from 'api/filter';
import { BoundValidator, validators } from 'forms';
import { Row, Col } from 'react-bootstrap';
import { Optional } from 'optional';

const validateLimit = validators.integer({
  checks: [validators.min(1), validators.max(50)]
});

interface Props {
  limit: Optional<number>;
  filters: Filter<any>[];
  onAddFilter: (filter: Filter<any>) => void;
  onRemoveFilter: (filter: Filter<any>) => void;
  onChangeLimit: (limit: number) => void;
}

interface State {
  addFilterValue: string;
}

export default class DashboardSearchForm extends React.PureComponent<Props, State> {
  limit: BoundValidator<number>;

  constructor(props: Props) {
    super(props);

    this.state = {
      addFilterValue: "",
    } as State;

    this.limit = validateLimit.bind(() => this.props.limit, {
      onChange: props.onChangeLimit
    });
  }

  private removeFilter(filter: Filter<any>): void {
    this.props.onRemoveFilter(filter);
  }

  private addFilterKey(e: any): boolean {
    e.preventDefault();

    if (e.key === 'Enter') {
      return this.addFilterEvent(e);
    }

    return false;
  }

  private addFilterEvent(e: any): boolean {
    e.preventDefault();

    const {addFilterValue} = this.state;

    const index = addFilterValue.indexOf(':');

    if (index >= 1) {
      const key = addFilterValue.substring(0, index);
      const value = addFilterValue.substring(index + 1);
      this.props.onAddFilter(new MetadataFilter(key, value));
    } else {
      this.props.onAddFilter(new TitleFilter(addFilterValue));
    }

    this.setState({ addFilterValue: "" });
    return false;
  }

  public render() {
    const {addFilterValue} = this.state as State;
    const {filters} = this.props;

    return <Form onSubmit={this.addFilterEvent.bind(this)}>
      <Row>
        <Col sm={9}>
          <FormGroup controlId="formAddFilter">
            <ControlLabel>Filter:</ControlLabel>

            <InputGroup>
              <FormControl
                type="text"
                value={addFilterValue}
                placeholder="Enter Filter"
                onKeyUp={this.addFilterKey.bind(this)}
                onChange={(e: any) => this.setState({ addFilterValue: e.target.value as string })} />

              <InputGroup.Button>
                <Button>Add Filter</Button>
              </InputGroup.Button>
            </InputGroup>

            <FormControl.Feedback />
          </FormGroup>

          <FormGroup>
            <ControlLabel>{filters.length > 0 ? "Current Filter:" : "No Filters"}</ControlLabel>
            <InputGroup>
              {filters.map((f, i) => {
                return <Button className="btn-space" onClick={() => this.removeFilter(f)} bsStyle="default" bsSize="xs" key={i}>{f.render()}</Button>;
              })}
            </InputGroup>
          </FormGroup>
        </Col>

        <Col sm={3}>
          <FormGroup controlId="formLimit" validationState={this.limit.$validationState}>
            <ControlLabel>Limit:</ControlLabel>

            <FormControl
              type="number"
              value={this.limit.value()}
              onChange={this.limit.onChange}
              componentClass="input"
              placeholder="select" />
          </FormGroup>
        </Col>
      </Row>
    </Form>;
  }
}