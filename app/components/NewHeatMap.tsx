import * as React from 'react';
import { Grid, Form, FormGroup, ControlLabel, FormControl, HelpBlock } from 'react-bootstrap';

export default class NewTimeSeries extends React.Component<{}, {}> {
  public render() {
    return (
      <Grid>
        <h4>Configure Heat Map</h4>

        <Form>
          <FormGroup controlId='name'>
            <ControlLabel>Name:</ControlLabel>
            <FormControl type="text" />
            <HelpBlock>Name that will be used as a title for the visualization</HelpBlock>
          </FormGroup>
        </Form>
      </Grid>
    );
  }
};
