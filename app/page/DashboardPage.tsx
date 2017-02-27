import * as React from 'react';
import { Grid, Navbar, Nav, NavItem, Glyphicon, ButtonGroup, Button, Row, Col } from 'react-bootstrap';
import { PagesContext } from 'api/interfaces';
import { Dashboard, LayoutEntry } from 'api/model';
import { Optional, absent, of } from 'optional';
import ReactGridLayout from 'react-grid-layout';
import EditVisualization from 'components/EditVisualization';

const ResponsiveReactGridLayout = ReactGridLayout.WidthProvider(ReactGridLayout);

interface Props {
  params: {
    id: string
  }
}

interface State {
  dashboard: Optional<Dashboard>,
  edit: Optional<string>
}

export default class DashboardPage extends React.Component<Props, State> {
  context: PagesContext;

  public static contextTypes: any = {
    db: React.PropTypes.object
  };

  constructor(props: Props) {
    super(props);

    this.state = {
      dashboard: absent<Dashboard>(),
      edit: absent<string>()
    };
  }

  public componentDidMount(): void {
    this.context.db.get(this.props.params.id).then(dashboard => {
      this.setState({ dashboard: dashboard });
    });
  }

  public render() {
    const {dashboard, edit} = this.state;

    let title = dashboard
      .map(dashboard => dashboard.title)
      .orElse(`Dashboard with ID '${this.props.params.id}' does not exist`);

    const main = dashboard.map(dashboard => {
      return edit.map(componentId => {
        return dashboard.getComponent(componentId).map(component => {
          return (
            <Grid>
              <h4>Editing Component</h4>

              <EditVisualization visualization={component.visualization} />

              <Row>
                <Col sm={12}>
                  <Button onClick={() => this.back()}>
                    <Glyphicon glyph="arrow-left" />
                    &nbsp;&nbsp;
                    <span>Back</span>
                  </Button>

                  <div className="pull-right">
                    <Button bsStyle="primary" onClick={() => this.back()}>
                      <span>Ok</span>
                    </Button>
                  </div>
                </Col>
              </Row>
            </Grid>
          );
        }).orElseGet(() => {
          return (
            <Grid>
              <h4>No component with ID: {componentId}</h4>
            </Grid>
          );
        });
      }).orElseGet(() => {
        return <ResponsiveReactGridLayout className="layout" layout={dashboard.layout} cols={12} measureBeforeMount={true} onLayoutChange={(layout: any) => this.layoutChanged(layout)}>
          {dashboard.components.map(component => {
            return <div className="component" key={component.id}>
              <div className="titlebar">
                <span>{component.title}</span>

                <div className="pull-right">
                  <div className="buttons">
                    <ButtonGroup bsSize="xs">
                      <Button onClick={() => this.edit(component.id)}>
                        <Glyphicon glyph="edit" />
                      </Button>
                    </ButtonGroup>
                  </div>
                </div>
              </div>
            </div>;
          })}
        </ResponsiveReactGridLayout>
      });
    }).get();

    return (
      <div>
        <Navbar collapseOnSelect staticTop={true}>
          <Navbar.Collapse>
            <Nav>
              <NavItem>
                <Glyphicon glyph="home" />
                <span>&nbsp;&nbsp;Main</span>
              </NavItem>
            </Nav>

            <Nav pullRight>
              <NavItem onClick={() => this.addComponent()}>
                <Glyphicon glyph="plus" />
                <span>&nbsp;&nbsp;Add Component</span>
              </NavItem>

              <NavItem onClick={() => this.save()}>
                <Glyphicon glyph="save" />
                <span>&nbsp;&nbsp;Save</span>
              </NavItem>
            </Nav>
          </Navbar.Collapse>
        </Navbar>

        <Grid fluid={true}>
          <h1>{title}</h1>
          {main}
        </Grid>
      </div>
    );
  }

  private back() {
    this.setState({ edit: absent<string>() });
  }

  private edit(componentId: string) {
    this.setState({ edit: of(componentId) });
  }

  private save() {
    this.state.dashboard.accept(dashboard => {
      this.context.db.save(dashboard);
    })
  }

  private addComponent() {
    this.setState((prev, _) => {
      return { dashboard: prev.dashboard.map(dashboard => dashboard.withNewComponent()) };
    });
  }

  private layoutChanged(layout: Array<LayoutEntry>) {
    this.setState((prev, _) => {
      return { dashboard: prev.dashboard.map(dashboard => dashboard.withLayout(layout)) };
    });
  }
};
