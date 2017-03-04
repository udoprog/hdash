import * as React from 'react';
import { Form, FormControl, FormGroup, InputGroup, ControlLabel, Button, Row, Col } from 'react-bootstrap';
import FontAwesome from 'react-fontawesome';
import { Range, RelativeRange, AbsoluteRange } from 'api/model';
import * as moment from 'moment';

interface Props {
  range: Range
}

interface State {
  range: Range;
}

export default class RangePicker extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      range: props.range
    };
  }

  render() {
    const { range } = this.state;

    var custom = null;

    if (range instanceof RelativeRange) {
      custom = (
        <Form>
          <FormGroup>
            <ControlLabel>
              From:
            </ControlLabel>
            <InputGroup>
              <FormControl type="text" value={`${range.value} ${range.unit}`} />

              <InputGroup.Button>
                <Button>
                  <FontAwesome name="calendar" />
                </Button>
              </InputGroup.Button>
            </InputGroup>
          </FormGroup>

          <FormGroup>
            <ControlLabel>
              To:
            </ControlLabel>
            <InputGroup>
              <FormControl type="text" value="now" />

              <InputGroup.Button>
                <Button>
                  <FontAwesome name="calendar" />
                </Button>
              </InputGroup.Button>
            </InputGroup>
          </FormGroup>
        </Form>
      );

      range.unit;
    } else if (range instanceof AbsoluteRange) {
      custom = (
        <Form>
          <FormGroup>
            <ControlLabel>
              From:
            </ControlLabel>
            <InputGroup>
              <FormControl type="text" value={moment(range.start).format()} />

              <InputGroup.Button>
                <Button>
                  <FontAwesome name="calendar" />
                </Button>
              </InputGroup.Button>
            </InputGroup>
          </FormGroup>

          <FormGroup>
            <ControlLabel>
              To:
            </ControlLabel>
            <InputGroup>
              <FormControl type="text" value={moment(range.start).format()} />

              <InputGroup.Button>
                <Button>
                  <FontAwesome name="calendar" />
                </Button>
              </InputGroup.Button>
            </InputGroup>
          </FormGroup>
        </Form>
      );
    }

    return (
      <Row>
        <Col sm={4}>
          {custom}
        </Col>
        <Col sm={8}>
          <h4>Quick Range</h4>

          <Row>
            <Col sm={6}>
              <a href="#">1 day</a>
            </Col>
            <Col sm={6}>
              <a href="#">15 minutes</a>
            </Col>
          </Row>
        </Col>
      </Row>
    );
  }
};
