import * as React from 'react';
import { Grid } from 'react-bootstrap';
import { Link } from 'react-router';

import NewVisualization from 'components/NewVisualization';

export default class VisualizationsPage extends React.Component<{}, {}> {
  public render() {
    return (
      <Grid>
        <h1>Visualizations</h1>

        <p>
          Re-usable visualizations that can be placed in <Link to="/dashboards">dashboards</Link>.
        </p>

        <NewVisualization />
      </Grid>
    );
  }
};
