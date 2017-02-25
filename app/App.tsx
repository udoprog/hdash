import * as React from 'react';

import { Grid, Row, Col, Navbar, Nav, NavItem } from 'react-bootstrap';
import { Router, Route, IndexRoute, browserHistory, IndexLink, Link } from 'react-router';
import { LinkContainer, IndexLinkContainer } from 'react-router-bootstrap';

import Dashboards from './page/Dashboards';
import Dashboard from './page/Dashboard';
import Alerting from './page/Alerting';
import Main from './page/Main';
import DatabaseProvider from './db/DatabaseProvider';

class Index extends React.Component<any, {}> {
  render() {
    const { children } = this.props;

    return (
      <div>
        <Navbar inverse collapseOnSelect fluid={true} staticTop={true}>
          <Navbar.Header>
            <Navbar.Brand>
              <IndexLink to="/">Heroic Dash</IndexLink>
            </Navbar.Brand>
            <Navbar.Toggle />
          </Navbar.Header>
          <Navbar.Collapse>
            <Nav>
              <IndexLinkContainer to="/">
                <NavItem>Main</NavItem>
              </IndexLinkContainer>
              <LinkContainer to="/dashboards">
                <NavItem>Dashboards</NavItem>
              </LinkContainer>
              <LinkContainer to="/alerting">
                <NavItem>Alerting</NavItem>
              </LinkContainer>
            </Nav>

            <Nav pullRight>
              <LinkContainer to="/me">
                <NavItem>User</NavItem>
              </LinkContainer>
            </Nav>
          </Navbar.Collapse>
        </Navbar>

        <Grid fluid={true}>
          <Row>
            <Col sm={12}>
              {children}
            </Col>
          </Row>
        </Grid>
      </div>
    );
  }
}

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
