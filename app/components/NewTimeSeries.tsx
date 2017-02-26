import * as React from 'react';
import { Grid, Form, FormGroup, ControlLabel, FormControl, HelpBlock } from 'react-bootstrap';

export default class NewTimeSeries extends React.Component<{}, {}> {
  public render() {
    return (
      <Grid>
        <h4>Configure Time Series</h4>

        <Form>
          <FormGroup controlId='name'>
            <ControlLabel>Name:</ControlLabel>
            <FormControl type="text" />
            <HelpBlock>Name of the Time Series</HelpBlock>
          </FormGroup>
        </Form>
      </Grid>
    );
  }
};
