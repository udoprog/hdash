import * as React from 'react';

import { Router, Route, IndexRoute, browserHistory } from 'react-router';

import IndexPage from 'page/IndexPage';
import DashboardsPage from 'page/DashboardsPage';
import DashboardPage from 'page/DashboardPage';
import AlertsPage from 'page/AlertsPage';
import VisualizationsPage from 'page/VisualizationsPage';
import MainPage from 'page/MainPage';
import DatabaseProvider from 'db/DatabaseProvider';

export default class App extends React.Component<{}, {}> {
  public render() {
    return (
      <DatabaseProvider>
        <Router history={browserHistory}>
          <Route path="/" component={IndexPage}>
            <IndexRoute component={MainPage} />
            <Route path="dashboards" component={DashboardsPage} />
            <Route path="dashboards/:id" component={DashboardPage} />
            <Route path="alerts" component={AlertsPage} />
            <Route path="visualizations" component={VisualizationsPage} />
            <Route path="me" component={MainPage} />
          </Route>
        </Router>
      </DatabaseProvider>
    );
  }
};
