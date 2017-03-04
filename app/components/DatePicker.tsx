import * as React from 'react';
import { FormControl, FormGroup, InputGroup, Button } from 'react-bootstrap';
import FontAwesome from 'react-fontawesome';
import * as moment from "moment";

interface Props {
}

interface State {
  date: moment.Moment;
}

export default class DatePicker extends React.Component<Props, State> {
  private openDatePicker: boolean;

  constructor(props: Props) {
    super(props);

    this.openDatePicker = false;

    this.state = {
      date: moment()
    }
  }

  render() {
    return (
      <FormGroup>
        <InputGroup>
          <FormControl type="text" value={"lol, no"} />

          <InputGroup.Button>
            <Button>
              <FontAwesome name="calendar" />
            </Button>
          </InputGroup.Button>
        </InputGroup>

        <InputGroup>
          <FormControl type="text" value={"lol, no"} />

          <InputGroup.Button>
            <Button>
              <FontAwesome name="calendar" />
            </Button>
          </InputGroup.Button>
        </InputGroup>
      </FormGroup>
    );
  }
};
