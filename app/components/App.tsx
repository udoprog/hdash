import * as React from 'react';

import { Router, Route, IndexRoute, browserHistory } from 'react-router';

import IndexPage from 'components/IndexPage';
import DashboardsPage from 'components/DashboardsPage';
import DashboardPage from 'components/DashboardPage';
import AlertsPage from 'components/AlertsPage';
import VisualizationsPage from 'components/VisualizationsPage';
import AdminPage from 'components/AdminPage';
import MainPage from 'components/MainPage';
import DataSourcesPage from 'components/DataSourcesPage';

import DatabaseProvider from 'db/DatabaseProvider';
import HeroicProvider from 'heroic/HeroicProvider';

export default class App extends React.Component<{}, {}> {
  public render() {
    return (
      <HeroicProvider>
        <DatabaseProvider mock={true}>
          <Router history={browserHistory}>
            <Route path="/" component={IndexPage}>
              <IndexRoute component={MainPage} />
              <Route path="dashboards" component={DashboardsPage} />
              <Route path="dashboards/:id" component={DashboardPage} />
              <Route path="datasources" component={DataSourcesPage} />
              <Route path="alerts" component={AlertsPage} />
              <Route path="visualizations" component={VisualizationsPage} />
              <Route path="admin" component={AdminPage} />
              <Route path="me" component={MainPage} />
            </Route>
          </Router>
        </DatabaseProvider>
      </HeroicProvider>
    );
  }
};
