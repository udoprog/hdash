import * as React from 'react';

import { Navbar, Nav, NavItem, Glyphicon } from 'react-bootstrap';
import { IndexLink } from 'react-router';
import { LinkContainer, IndexLinkContainer } from 'react-router-bootstrap';

export default class Index extends React.Component<any, {}> {
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
                  <Glyphicon glyph="home" />
                  <span>&nbsp;&nbsp;Main</span>
                </NavItem>
              </IndexLinkContainer>
              <LinkContainer to="/dashboards">
                <NavItem>
                  <Glyphicon glyph="th" />
                  <span>&nbsp;&nbsp;Dashboards</span>
                </NavItem>
              </LinkContainer>
              <LinkContainer to="/alerting">
                <NavItem>
                  <Glyphicon glyph="bell" />
                  <span>&nbsp;&nbsp;Alerting</span>
                </NavItem>
              </LinkContainer>
            </Nav>

            <Nav pullRight>
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