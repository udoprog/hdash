import * as React from 'react';
import { Form, FormControl, FormGroup, InputGroup, ControlLabel, Button, Row, Col } from 'react-bootstrap';
import FontAwesome from 'react-fontawesome';
import { Range, NowRelativeRange, RoundedRelativeRange, RangeOffset, RoundedStartRelativeRange, AbsoluteRange } from 'api/model';
import * as unit from 'api/unit';
import * as moment from 'moment';
import DatePicker from './DatePicker';

const COL1: [Range, string][] = [
  [new NowRelativeRange({ value: 2, unit: unit.Days }), 'Last 2 days'],
  [new NowRelativeRange({ value: 7, unit: unit.Days }), "Last 7 days"],
  [new NowRelativeRange({ value: 30, unit: unit.Days }), "Last 30 days"],
  [new NowRelativeRange({ value: 60, unit: unit.Days }), "Last 60 days"],
  [new NowRelativeRange({ value: 6, unit: unit.Months }), "Last 6 months"],
  [new NowRelativeRange({ value: 1, unit: unit.Years }), "Last 1 year"],
  [new NowRelativeRange({ value: 2, unit: unit.Years }), "Last 2 years"],
  [new NowRelativeRange({ value: 5, unit: unit.Years }), "Last 5 years"]
];

const COL2: [Range, string][] = [
  [
    new RoundedRelativeRange({ unit: unit.Days, offset: new RangeOffset({ value: 1, unit: unit.Days }) }),
    'Yesterday'
  ],
  [
    new RoundedRelativeRange({ unit: unit.Days, offset: new RangeOffset({ value: 2, unit: unit.Days }) }),
    'Day before yesterday'
  ],
  [
    new RoundedRelativeRange({ unit: unit.Days, offset: new RangeOffset({ value: 1, unit: unit.Weeks }) }),
    'This day last week'
  ],
  [
    new RoundedRelativeRange({ unit: unit.Weeks, offset: new RangeOffset({ value: 1, unit: unit.Weeks }) }),
    'Previous week'
  ],
  [
    new RoundedRelativeRange({ unit: unit.Months, offset: new RangeOffset({ value: 1, unit: unit.Months }) }),
    'Previous month'
  ],
  [
    new RoundedRelativeRange({ unit: unit.Years, offset: new RangeOffset({ value: 1, unit: unit.Years }) }),
    'Previous year'
  ]
];

const NO_OFFSET = new RangeOffset({ value: 0, unit: unit.Days });

const COL3: [Range, string][] = [
  [
    new RoundedRelativeRange({ unit: unit.Days, offset: NO_OFFSET }),
    'Today'
  ],
  [
    new RoundedStartRelativeRange({ unit: unit.Days }),
    'Today so far'
  ],
  [
    new RoundedRelativeRange({ unit: unit.Weeks, offset: NO_OFFSET }),
    'This week'
  ],
  [
    new RoundedStartRelativeRange({ unit: unit.Weeks }),
    'This week so far'
  ],
  [
    new RoundedRelativeRange({ unit: unit.Months, offset: NO_OFFSET }),
    'This month'
  ],
  [
    new RoundedRelativeRange({ unit: unit.Years, offset: NO_OFFSET }),
    'This year'
  ]
];

const COL4: [Range, string][] = [
  [
    new NowRelativeRange({ value: 5, unit: unit.Minutes }),
    'Last 5 minutes'
  ],
  [
    new NowRelativeRange({ value: 15, unit: unit.Minutes }),
    'Last 15 minutes'
  ],
  [
    new NowRelativeRange({ value: 30, unit: unit.Minutes }),
    'Last 30 minutes'
  ],
  [
    new NowRelativeRange({ value: 1, unit: unit.Hours }),
    'Last 1 hour'
  ],
  [
    new NowRelativeRange({ value: 3, unit: unit.Hours }),
    'Last 3 hours'
  ],
  [
    new NowRelativeRange({ value: 6, unit: unit.Hours }),
    'Last 6 hours'
  ],
  [
    new NowRelativeRange({ value: 12, unit: unit.Hours }),
    'Last 12 hours'
  ],
  [
    new NowRelativeRange({ value: 24, unit: unit.Hours }),
    'Last 24 hours'
  ],
];

const COLS: [Range, string][][] = [
  COL1, COL2, COL3, COL4
];

interface Props {
  range: Range;
  onChange: (range: Range) => void;
}

interface State {
  startValue: string;
  endValue: string;
  startMoment?: moment.Moment,
  endMoment?: moment.Moment,
  openStartCalendar: boolean;
  openEndCalendar: boolean;
  valueChanged: boolean;
}

export default class RangePicker extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      startValue: props.range.renderStart(),
      endValue: props.range.renderEnd(),
      openStartCalendar: false,
      openEndCalendar: false,
      valueChanged: false
    }
  }

  componentWillReceiveProps(nextProps: Props) {
    this.setState({
      startValue: nextProps.range.renderStart(),
      endValue: nextProps.range.renderEnd(),
      openStartCalendar: false,
      openEndCalendar: false,
      valueChanged: false,
    });
  }

  render() {
    const { range } = this.props;

    const {
      startValue,
      startMoment,
      endValue,
      endMoment,
      openStartCalendar,
      openEndCalendar,
      valueChanged
    } = this.state;

    const now = moment();

    const startCalendar = openStartCalendar ? <DatePicker moment={startMoment || range.momentStart(now)} onChange={m => {
      const now = moment();
      const endMoment = range.momentEnd(now);
      this.props.onChange(new AbsoluteRange({ start: m, end: endMoment }));
    }} /> : null;

    const endCalendar = openEndCalendar ? <DatePicker moment={endMoment || range.momentEnd(now)} onChange={m => {
      const now = moment();
      const startMoment = range.momentStart(now);
      this.props.onChange(new AbsoluteRange({ start: startMoment, end: m }));
    }} /> : null;

    const custom = (
      <Form>
        <FormGroup validationState={!valueChanged || startMoment ? 'success' : 'error'}>
          <ControlLabel>From:</ControlLabel>

          <InputGroup>
            <FormControl type="text" value={startValue} onChange={(e: any) => {
              const parsed = moment(e.target.value);

              this.setState({
                startValue: e.target.value,
                startMoment: parsed.isValid() ? parsed : undefined,
                valueChanged: true
              });
            }} onFocus={() => {
              this.convertToAbsolute();
            }} onBlur={() => {
              this.convertToCurrent();
            }} />

            <InputGroup.Button>
              <Button onClick={() => {
                this.setState({
                  openStartCalendar: !openStartCalendar
                });
              }}>
                <FontAwesome name="calendar" />
              </Button>
            </InputGroup.Button>
          </InputGroup>
        </FormGroup>

        {startCalendar}

        <FormGroup validationState={!valueChanged || endMoment ? 'success' : 'error'}>
          <ControlLabel>To:</ControlLabel>

          <InputGroup>
            <FormControl type="text" value={endValue} onChange={(e: any) => {
              const parsed = moment(e.target.value);

              this.setState({
                endValue: e.target.value,
                endMoment: parsed.isValid() ? parsed : undefined,
                valueChanged: true
              });
            }} onFocus={() => {
              this.convertToAbsolute();
            }} onBlur={() => {
              this.convertToCurrent();
            }} />

            <InputGroup.Button>
              <Button onClick={() => {
                this.setState({
                  openEndCalendar: !openEndCalendar
                });
              }}>
                <FontAwesome name="calendar" />
              </Button>
            </InputGroup.Button>
          </InputGroup>
        </FormGroup>

        {endCalendar}
      </Form >
    );

    const quickRangeWidth = 12 / COLS.length;

    return (
      <Row className='range-picker'>
        <Col sm={4}>
          <h4>Custom Range</h4>
          {custom}
        </Col>
        <Col sm={8}>
          <h4>Quick Range</h4>

          <Row>
            {COLS.map((col, index) => (
              <Col key={index} sm={quickRangeWidth}>
                <ul className="quick-range-list">
                  {col.map(([r, title], index) => {
                    return (
                      <li className={r.equals(range) ? "active" : ""} key={index}>
                        <a className='set-range' onClick={() => this.setRange(r)}>{title}</a>
                      </li>
                    );
                  })}
                </ul>
              </Col>
            ))}
          </Row>
        </Col>
      </Row>
    );
  }

  private convertToAbsolute() {
    if (this.state.valueChanged) {
      return;
    }

    const { range } = this.props;

    /* no need to convert absolute ranges */
    if (range instanceof AbsoluteRange) {
      return;
    }

    const now = moment();

    const startMoment = range.momentStart(now);
    const endMoment = range.momentEnd(now);

    this.setState({
      startValue: startMoment.format(),
      endValue: range.momentEnd(now).format(),
      startMoment: startMoment,
      endMoment: endMoment,
      valueChanged: false
    });
  }

  private convertToCurrent() {
    if (this.state.valueChanged) {
      return;
    }

    const { range } = this.props;

    this.setState({
      startValue: range.renderStart(),
      endValue: range.renderEnd(),
      startMoment: undefined,
      endMoment: undefined,
      valueChanged: false
    });
  }

  private setRange(range: Range) {
    this.props.onChange(range);
  }
};
