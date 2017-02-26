import * as React from 'react';
import { ListGroup, ListGroupItem } from 'react-bootstrap';

import NewTimeSeries from './NewTimeSeries';
import NewText from './NewText';
import NewHeatMap from './NewHeatMap';

interface State {
  page?: string,
}

export default class NewVisualization extends React.Component<{}, State> {
  constructor(props: any) {
    super(props);

    this.state = {
    };
  }

  public render() {
    switch (this.state.page) {
      case 'new-time-series':
        return <NewTimeSeries />;
      case 'new-text':
        return <NewText />;
      case 'new-heat-map':
        return <NewHeatMap />;
      default:
        return (
          <ListGroup>
            <ListGroupItem onClick={() => this.setPage('new-time-series')}>
              <h4>Time Series</h4>
              <p>
                A time series.
              Can be plotted as <b>lines</b>, <b>bars</b>, <b>spreads</b>, or <b>histograms</b>.
            </p>
            </ListGroupItem>
            <ListGroupItem onClick={() => this.setPage('new-text')}>
              <h4>Text</h4>
              <p>
                A markdown-sourced text area.
              </p>
            </ListGroupItem>
            <ListGroupItem onClick={() => this.setPage('new-heat-map')}>
              <h4>Heat Map</h4>
              <p>
                A two-dimensional area showing a color gradient representing the most recent recorded values.
              </p>
            </ListGroupItem>
          </ListGroup>
        );
    }
  }

  private setPage(page: string) {
    this.setState({ page: page });
  }
};
