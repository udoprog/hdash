import * as React from 'react';
import * as moment from 'moment';
import { Button } from 'react-bootstrap';
import FontAwesome from 'react-fontawesome';

interface Props {
  moment: moment.Moment;
  onChange: (moment: moment.Moment) => void;
}

interface State {
  moment: moment.Moment
}

export default class DatePicker extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      moment: props.moment
    }
  }

  componentWillReceiveProps(nextProps: Props) {
    this.setState({ moment: nextProps.moment });
  }

  render() {
    const { moment: currentMoment } = this.props;
    const { moment } = this.state;

    // const days = moment.daysInMonth();

    const current = moment.clone().startOf('month');

    var daysInMonth = current.daysInMonth();
    var currentWeek = current.week();
    var weeks: moment.Moment[][] = [];
    var last: moment.Moment[] = [];

    if (current.weekday() > 0) {
      daysInMonth += current.weekday();
      current.subtract(current.weekday(), 'days');
    }

    for (var i = 0; i < daysInMonth; i++) {
      last.push(current.clone());
      current.add(1, 'day');

      if (current.week() > currentWeek) {
        currentWeek = current.week();
        weeks.push(last);
        last = [];
      }
    }

    for (var i = current.weekday(); i < 7; i++) {
      last.push(current.clone());
      current.add(1, 'day');
    }

    if (last.length > 0) {
      weeks.push(last);
    }

    return (
      <div className='date-picker'>
        <div className='title'>
          <Button bsSize='xs' className='pull-left' onClick={() => {
            this.setState({
              moment: moment.clone().subtract(1, 'months')
            })
          }}>
            <FontAwesome name='caret-left' />
          </Button>

          <span className='month-year'>{moment.format('MMMM YYYY')}</span>

          <Button bsSize='xs' className='pull-right' onClick={() => {
            this.setState({
              moment: moment.clone().add(1, 'months')
            })
          }}>
            <FontAwesome name='caret-right' />
          </Button>
        </div>

        <div className='week'>
          {weeks[0].map((day, index) => {
            return (
              <span key={index} className='day-title'>
                {day.format('dd')}
              </span>
            );
          })}
        </div>

        {weeks.map((week, index) => {
          return <div key={index} className='week'>
            {week.map((day, index) => {
              const otherMonth = moment.month() !== day.month();
              const today = currentMoment.isSame(day, 'days');

              return (
                <span key={index} className='day'>
                  <span className={'button' + (otherMonth ? ' other-month' : '') + (today ? ' today' : '')} onClick={() => this.setMoment(day)}>
                    {day.format('D')}
                  </span>
                </span>
              );
            })}
          </div>;
        })}
      </div>
    )
  }

  private setMoment(moment: moment.Moment) {
    this.props.onChange(moment);
  }
}
