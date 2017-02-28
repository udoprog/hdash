import * as React from 'react';

import { Navbar, Nav, NavItem } from 'react-bootstrap';
import { IndexLink } from 'react-router';
import { LinkContainer, IndexLinkContainer } from 'react-router-bootstrap';
import FontAwesome from 'react-fontawesome';

export default class IndexPage extends React.Component<any, {}> {
  render() {
    const { children } = this.props;

    return (
      <div>
        <Navbar inverse collapseOnSelect staticTop={true}>
          <Navbar.Header>
            <Navbar.Brand>
              <IndexLink to="/">Heroic Dash</IndexLink>
            </Navbar.Brand>
            <Navbar.Toggle />
          </Navbar.Header>

          <Navbar.Collapse>
            <Nav>
              <IndexLinkContainer to="/">
                <NavItem>
                  <FontAwesome name="home" />
                  <span>&nbsp;&nbsp;Main</span>
                </NavItem>
              </IndexLinkContainer>
              <LinkContainer to="/datasources">
                <NavItem>
                  <FontAwesome name="database" />
                  <span>&nbsp;&nbsp;Data Sources</span>
                </NavItem>
              </LinkContainer>
              <LinkContainer to="/visualizations">
                <NavItem>
                  <FontAwesome name="eye" />
                  <span>&nbsp;&nbsp;Visualizations</span>
                </NavItem>
              </LinkContainer>
              <LinkContainer to="/dashboards">
                <NavItem>
                  <FontAwesome name="th" />
                  <span>&nbsp;&nbsp;Dashboards</span>
                </NavItem>
              </LinkContainer>
              <LinkContainer to="/alerts">
                <NavItem>
                  <FontAwesome name="bell" />
                  <span>&nbsp;&nbsp;Alerts</span>
                </NavItem>
              </LinkContainer>
            </Nav>

            <Nav pullRight>
              <LinkContainer to="/admin">
                <NavItem>Admin</NavItem>
              </LinkContainer>

              <LinkContainer to="/me">
                <NavItem>User</NavItem>
              </LinkContainer>
            </Nav>
          </Navbar.Collapse>
        </Navbar>

        {children}
      </div>
    );
  }
};
