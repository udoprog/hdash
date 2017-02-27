import * as React from 'react';
import { Grid, Row, Col } from 'react-bootstrap';

export default class MainPage extends React.Component<{}, {}> {
  public render() {
    return (
      <Grid>
        <Row>
          <Col sm={12}>
            <p>
              Welcome to <em>Heroic Dash</em>
            </p>
          </Col>
        </Row>
      </Grid>
    );
  }
};
