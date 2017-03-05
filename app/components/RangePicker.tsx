import * as React from 'react';
import { Row, Col } from 'react-bootstrap';
import { Range } from 'api/model';
import * as instant from 'api/instant';
import * as unit from 'api/unit';
import InstantPicker from './InstantPicker';

function relativeNow(unit: unit.Unit, value: number) {
  return new Range({
    start: new instant.Relative({
      offset: new instant.Duration({ value: value, unit: unit })
    }),
    end: new instant.Now({})
  });
}

function constantOffset(unit: unit.Unit, offsetValue: number, offsetUnit: unit.Unit) {
  return new Range({
    start: new instant.StartOf({
      unit: unit,
      offset: new instant.Duration({ value: offsetValue, unit: offsetUnit })
    }),
    end: new instant.EndOf({
      unit: unit,
      offset: new instant.Duration({ value: offsetValue, unit: offsetUnit })
    }),
  });
}

const NO_OFFSET = new instant.Duration({ value: 0, unit: unit.Days });

function current(unit: unit.Unit) {
  return new Range({
    start: new instant.StartOf({ unit: unit, offset: NO_OFFSET }),
    end: new instant.EndOf({ unit: unit, offset: NO_OFFSET }),
  });
}

function currentToNow(unit: unit.Unit) {
  return new Range({
    start: new instant.StartOf({ unit: unit, offset: NO_OFFSET }),
    end: new instant.Now({}),
  });
}

const COL1: [Range, string][] = [
  [relativeNow(unit.Days, 2), 'Last 2 days'],
  [relativeNow(unit.Days, 7), 'Last 7 days'],
  [relativeNow(unit.Days, 30), 'Last 30 days'],
  [relativeNow(unit.Days, 60), 'Last 60 days'],
  [relativeNow(unit.Months, 6), 'Last 6 months'],
  [relativeNow(unit.Years, 1), 'Last 1 year'],
  [relativeNow(unit.Years, 2), 'Last 2 year'],
  [relativeNow(unit.Years, 5), 'Last 5 year'],
];

const COL2: [Range, string][] = [
  [constantOffset(unit.Days, 1, unit.Days), 'Yesterday'],
  [constantOffset(unit.Days, 2, unit.Days), 'Day before yesterday'],
  [constantOffset(unit.Days, 7, unit.Days), 'This day last week'],
  [constantOffset(unit.Weeks, 1, unit.Weeks), 'Previous week'],
  [constantOffset(unit.Months, 1, unit.Months), 'Previous month'],
  [constantOffset(unit.Years, 1, unit.Years), 'Previous Year'],
];

const COL3: [Range, string][] = [
  [current(unit.Days), 'Today'],
  [currentToNow(unit.Days), 'Today so far'],
  [current(unit.Weeks), 'This week'],
  [currentToNow(unit.Weeks), 'This week so far'],
  [current(unit.Months), 'This month'],
  [current(unit.Years), 'This year'],
];

const COL4: [Range, string][] = [
  [relativeNow(unit.Minutes, 5), 'Last 5 minutes'],
  [relativeNow(unit.Minutes, 15), 'Last 15 minutes'],
  [relativeNow(unit.Minutes, 30), 'Last 30 minutes'],
  [relativeNow(unit.Hours, 1), 'Last 1 hour'],
  [relativeNow(unit.Hours, 3), 'Last 3 hours'],
  [relativeNow(unit.Hours, 6), 'Last 6 hours'],
  [relativeNow(unit.Hours, 12), 'Last 12 hours'],
  [relativeNow(unit.Hours, 24), 'Last 24 hours'],
];

const COLS: [Range, string][][] = [
  COL1, COL2, COL3, COL4
];

interface Props {
  range: Range;
  onChange: (range: Range) => void;
}

interface State {
}

export default class RangePicker extends React.Component<Props, State> {
  render() {
    const { range } = this.props;

    const quickRangeWidth = 12 / COLS.length;

    return (
      <Row className='range-picker'>
        <Col sm={4}>
          <h4>Custom Range</h4>

          <InstantPicker label="From:" instant={range.start} onChange={instant => {
            this.props.onChange(new Range({ start: instant, end: range.end }))
          }} />

          <InstantPicker label="To:" instant={range.end} onChange={instant => {
            this.props.onChange(new Range({ start: range.start, end: instant }))
          }} />
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

  private setRange(range: Range) {
    this.props.onChange(range);
  }
};
