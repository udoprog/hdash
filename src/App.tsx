import * as React from 'react';

import {Grid, Row, Col, Nav, NavItem} from 'react-bootstrap';
import {Router, Route, IndexRoute, Link, browserHistory} from 'react-router';
import {LinkContainer} from 'react-router-bootstrap';

import Dashboards from './page/Dashboards';
import Dashboard from './page/Dashboard';
import Alerting from './page/Alerting';
import Main from './page/Main';
import Database from './Database';

class Index extends React.Component<any, {}> {
  render() {
    const { children } = this.props;

    return (
      <Grid fluid={true}>
        <Row>
          <Col sm={2}>
            <Nav stacked>
              <LinkContainer to="/">
                <NavItem>Main</NavItem>
              </LinkContainer>
              <LinkContainer to="/dashboard">
                <NavItem>Dashboard</NavItem>
              </LinkContainer>
              <LinkContainer to="/alerting">
                <NavItem>Alerting</NavItem>
              </LinkContainer>
            </Nav>
          </Col>
          <Col sm={10}>{children}</Col>
        </Row>
      </Grid>
    );
  }
}

export default class App extends React.Component<{}, {}> {
  public render() {
    return (
      <Database mock={true}>
        <Router history={browserHistory}>
          <Route path="/" component={Index}>
            <IndexRoute component={Main} />
            <Route path="dashboard" component={Dashboards} />
            <Route path="dashboard/:id" component={Dashboard} />
            <Route path="alerting" component={Alerting} />
          </Route>
        </Router>
      </Database>
    );
  }
};
