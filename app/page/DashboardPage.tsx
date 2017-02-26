import * as React from 'react';
import { Grid, Navbar, Nav, NavItem, Glyphicon } from 'react-bootstrap';
import { PagesContext } from 'api/interfaces';
import { Dashboard, LayoutEntry } from 'api/model';
import { Optional, absent } from 'optional';
import ReactGridLayout from 'react-grid-layout';

const ResponsiveReactGridLayout = ReactGridLayout.WidthProvider(ReactGridLayout);

interface Props {
  params: {
    id: string
  }
}

interface State {
  dashboard: Optional<Dashboard>
}

export default class DashboardPage extends React.Component<Props, State> {
  context: PagesContext;

  public static contextTypes: any = {
    db: React.PropTypes.object
  };

  constructor(props: Props) {
    super(props);

    this.state = {
      dashboard: absent<Dashboard>()
    };
  }

  public componentDidMount(): void {
    this.context.db.get(this.props.params.id).then(dashboard => {
      this.setState({ dashboard: dashboard });
    });
  }

  public render() {
    const {dashboard} = this.state;

    let title = dashboard
      .map(dashboard => dashboard.title)
      .orElse(`Dashboard with ID '${this.props.params.id}' does not exist`);

    const grid = dashboard.map(dashboard => {
      return <ResponsiveReactGridLayout className="layout" layout={dashboard.layout} cols={12} measureBeforeMount={true} onLayoutChange={(layout: any) => this.layoutChanged(layout)}>
        {dashboard.components.map(component => {
          return <div className="component" key={component.id}>{component.title}</div>;
        })}
      </ResponsiveReactGridLayout>
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
          {grid}
        </Grid>
      </div>
    );
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
