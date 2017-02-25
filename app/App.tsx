import * as React from 'react';

import { Router, Route, IndexRoute, browserHistory } from 'react-router';

import Index from './page/Index';
import Dashboards from './page/Dashboards';
import Dashboard from './page/Dashboard';
import Alerting from './page/Alerting';
import Main from './page/Main';
import DatabaseProvider from './db/DatabaseProvider';

export default class App extends React.Component<{}, {}> {
  public render() {
    return (
      <DatabaseProvider>
        <Router history={browserHistory}>
          <Route path="/" component={Index}>
            <IndexRoute component={Main} />
            <Route path="dashboards" component={Dashboards} />
            <Route path="dashboards/:id" component={Dashboard} />
            <Route path="alerting" component={Alerting} />
            <Route path="me" component={Main} />
          </Route>
        </Router>
      </DatabaseProvider>
    );
  }
};
