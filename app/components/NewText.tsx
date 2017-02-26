import * as React from 'react';
import { Grid, Form, FormGroup, ControlLabel, FormControl, HelpBlock } from 'react-bootstrap';

export default class NewText extends React.Component<{}, {}> {
  public render() {
    return (
      <Grid>
        <h4>Configure Text</h4>

        <Form>
          <FormGroup controlId='name'>
            <ControlLabel>Name:</ControlLabel>
            <FormControl type="text" />
            <HelpBlock>Name of the Description</HelpBlock>
          </FormGroup>

          <FormGroup controlId='content'>
            <ControlLabel>Content:</ControlLabel>
            <FormControl componentClass="textarea" />
          </FormGroup>
        </Form>
      </Grid>
    );
  }
};
