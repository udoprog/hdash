import * as React from 'react'
import { FormControl, FormGroup, InputGroup, ControlLabel, Button } from 'react-bootstrap'
import FontAwesome from 'react-fontawesome'
import { Instant, Absolute, Now } from 'instant'
import * as moment from 'moment'

import DatePicker from './DatePicker'

interface Props {
  label: string;
  instant: Instant;
  onChange: (instant: Instant) => void;
}

interface State {
  value: string
  currentMoment?: moment.Moment,
  openCalendar: boolean
  changed: boolean
}

export default class RangePicker extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)

    this.state = {
      value: props.instant.render(),
      openCalendar: false,
      changed: false
    }
  }

  componentWillReceiveProps(nextProps: Props) {
    this.setState({
      value: nextProps.instant.render(),
      changed: false,
    })
  }

  render() {
    const { instant } = this.props

    const {
      value,
      currentMoment,
      openCalendar,
      changed
    } = this.state

    const now = moment()

    const calendar = openCalendar ? <DatePicker moment={currentMoment || instant.moment(now)} onChange={m => {
      this.props.onChange(new Absolute({ when: m }))
    }} /> : null

    return (
      <div>
        <FormGroup validationState={!changed || currentMoment ? 'success' : 'error'}>
          <ControlLabel>{this.props.label}</ControlLabel>

          <InputGroup>
            <FormControl type="text" value={value} onChange={(e: any) => {
              const parsed = moment(e.target.value)

              this.setState({
                value: e.target.value,
                currentMoment: parsed.isValid() ? parsed : undefined,
                changed: true
              })
            }} onFocus={() => {
              this.convertToAbsolute()
            }} onBlur={() => {
              this.convertToCurrent()
            }} />

            <InputGroup.Button>
              <Button title='Set to now' onClick={() => {
                this.props.onChange(new Now({}));
                this.setState({ openCalendar: false });
              }}>
                <FontAwesome name="dot-circle-o" />
              </Button>

              <Button title='Pick day in calendar' onClick={() => {
                this.setState({
                  openCalendar: !openCalendar
                })
              }}>
                <FontAwesome name="calendar" />
              </Button>
            </InputGroup.Button>
          </InputGroup>
        </FormGroup>

        {calendar}
      </div>
    )
  }

  private convertToAbsolute() {
    if (this.state.changed) {
      return
    }

    const { instant } = this.props

    if (instant instanceof Absolute) {
      return
    }

    const now = moment()

    const next = instant.moment(now);

    this.setState({
      value: next.format(),
      currentMoment: next,
      changed: false
    })
  }

  private convertToCurrent() {
    if (this.state.changed) {
      return
    }

    const { instant } = this.props

    this.setState({
      value: instant.render(),
      currentMoment: undefined,
      changed: false
    })
  }
};
