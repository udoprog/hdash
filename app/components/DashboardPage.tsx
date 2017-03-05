import * as React from 'react';
import { Grid, Navbar, Nav, NavItem, Glyphicon, ButtonGroup, Button } from 'react-bootstrap';
import FontAwesome from 'react-fontawesome';
import { PagesContext, RouterContext } from 'api/interfaces';
import { Dashboard, Component, LayoutEntry, Range, VisualOptions } from 'api/model';
import { Optional, absent, of, ofNullable } from 'optional';
import ReactGridLayout from 'react-grid-layout';
import EditComponent, { EditComponentOptions } from 'components/EditComponent';
import { RouteComponentProps } from 'react-router';
import RangePicker from 'components/RangePicker';

const ResponsiveReactGridLayout = ReactGridLayout.WidthProvider(ReactGridLayout);

const ROW_HEIGHT = 150;

interface Params {
  id: string
}

interface Props extends RouteComponentProps<Params, {}> {
}

interface State {
  locked: boolean;
  dashboard: Optional<Dashboard>;
  editComponent: Optional<string>;
  editRange: boolean;
}

export default class DashboardPage extends React.Component<Props, State> {
  context: PagesContext & RouterContext;

  public static contextTypes: any = {
    db: React.PropTypes.object,
    router: React.PropTypes.any
  };

  constructor(props: Props) {
    super(props);

    const { query } = this.props.location;

    this.state = {
      locked: query.unlocked !== 'true',
      dashboard: absent<Dashboard>(),
      editComponent: ofNullable(query.edit),
      editRange: query.editRange === 'true',
    };
  }

  public componentDidMount(): void {
    this.context.db.get(this.props.params.id).then(dashboard => {
      this.setState({ dashboard: dashboard });
    });
  }

  private updateUrl(): () => void {
    return () => {
      const { locked, editComponent, editRange } = this.state;
      const { pathname, query } = this.props.location;
      const { router } = this.context;

      query.unlocked = !locked ? 'true' : undefined;
      query.edit = editComponent.orElse(undefined);
      query.editRange = editRange ? 'true' : undefined;

      router.replace({
        pathname: pathname,
        query: query
      });
    };
  }

  private renderLock() {
    return (
      <NavItem title="Lock" onClick={() => this.setState({ locked: true, editComponent: absent<string>() }, this.updateUrl())}>
        <Glyphicon glyph="lock" />
        <span className='icon-text'>Lock</span>
      </NavItem>
    );
  }

  private renderUnlock() {
    return (
      <NavItem title="Unlock to Edit" onClick={() => this.setState({ locked: false }, this.updateUrl())}>
        <Glyphicon glyph="wrench" />
        <span className='icon-text'>Unlock</span>
      </NavItem>
    );
  }

  public render() {
    const { locked, dashboard, editComponent, editRange } = this.state;

    let title = dashboard
      .map(dashboard => dashboard.title)
      .orElse(`Dashboard with ID '${this.props.params.id}' does not exist`);

    const rangeToggle = (
      <NavItem onClick={() => this.setState({ editRange: !editRange }, this.updateUrl())} active={editRange}>
        <FontAwesome name="clock-o" />
        <span className='icon-text'>
          {dashboard.map(d => {
            return (
              <span>
                <b>{d.range.start.render()}</b> until <b>{d.range.end.render()}</b>
              </span>
            );
          }).orElseGet(() => <em>unknown</em>)}
        </span>
      </NavItem>
    );

    const editRangeComponent = dashboard.map(d => editRange ? (
      <Grid className='range-picker-menu'>
        <RangePicker range={d.range} onChange={(range: Range) => this.rangeChanged(range)}></RangePicker>
      </Grid>
    ) : null).get();

    const lockToggle = locked ? this.renderUnlock() : this.renderLock();

    const addComponent = !locked ? (
      <NavItem onClick={() => this.addComponent()}>
        <Glyphicon glyph="plus" />
        <span className='icon-text'>Add Component</span>
      </NavItem>
    ) : null;

    const save = !locked ? (
      <NavItem onClick={() => this.save()}>
        <Glyphicon glyph="save" />
        <span className='icon-text'>Save</span>
      </NavItem>
    ) : null;

    const main = dashboard.map(dashboard => {
      const options: EditComponentOptions = {
        range: dashboard.range
      };

      return editComponent.map(componentId => {
        return dashboard.getComponent(componentId).map(component => {
          return (
            <EditComponent
              component={component}
              options={options}
              onBack={(component) => this.back(component)} />
          );
        }).orElseGet(() => {
          return (
            <Grid>
              <h4>No component with ID: {componentId}</h4>
            </Grid>
          );
        });
      }).orElseGet(() => {
        if (matchMedia("(min-width: 768px)").matches) {
          return this.renderLayoutGrid(title, locked, dashboard);
        } else {
          return this.renderList(title, locked, dashboard);
        }
      });
    }).get();

    return (
      <div>
        <Navbar collapseOnSelect staticTop={true}>
          <Nav pullRight>
            {addComponent}
            {save}
            {lockToggle}
            {rangeToggle}
          </Nav>
        </Navbar>

        <div>
          {editRangeComponent}
        </div>

        {main}
      </div>
    );
  }

  private renderLayoutGrid(title: string, locked: boolean, dashboard: Dashboard) {
    return (
      <Grid fluid={true}>
        <h1>{title}</h1>

        <ResponsiveReactGridLayout
          className="layout"
          draggableHandle=".titlebar"
          layout={dashboard.layout}
          cols={12}
          measureBeforeMount={true}
          onLayoutChange={(layout: any) => this.layoutChanged(layout)}
          rowHeight={ROW_HEIGHT}
          isDraggable={!locked}
          isResizable={!locked}
        >
          {this.renderComponents(locked, dashboard)}
        </ResponsiveReactGridLayout>
      </Grid>
    );
  }

  private renderList(title: string, locked: boolean, dashboard: Dashboard) {
    return (
      <Grid fluid={true}>
        <h1>{title}</h1>
        {this.renderComponents(locked, dashboard)}
      </Grid >
    );
  }

  private renderComponents(locked: boolean, dashboard: Dashboard) {
    return dashboard.components.map(component => {
      const buttons = !locked ? (
        <div className="pull-right">
          <div className="buttons">
            <ButtonGroup bsSize="xs">
              <Button onClick={() => this.edit(component.id)}>
                <Glyphicon glyph="edit" />
              </Button>

              <Button bsStyle="danger" onClick={() => this.remove(component)}>
                <Glyphicon glyph="remove" />
              </Button>
            </ButtonGroup>
          </div>
        </div>
      ) : <div />;

      const showTitleBar = !!component.title || !locked;

      const titlebar = showTitleBar ? (
        <div className={"titlebar" + (!locked ? " draggable" : "")}>
          <span className="text">{component.title}</span>
          {buttons}
        </div>
      ) : <div />;

      var componentClasses = "component";

      if (showTitleBar) {
        componentClasses += " visible-titlebar";
      }

      if (!locked) {
        componentClasses += " editing";
      } else {
        componentClasses += " locked";
      }

      const visualOptions: VisualOptions = {
        range: dashboard.range,
      };

      return (
        <div key={component.id} className={componentClasses}>
          {titlebar}
          {component.visualization.renderVisual(visualOptions)}
        </div>
      );
    })
  }

  private back(component: Component) {
    this.setState((prev, _) => {
      return {
        editComponent: absent<string>(),
        dashboard: prev.dashboard.map(dashboard => {
          return dashboard.withReplacedComponent(component);
        })
      }
    }, this.updateUrl());
  }

  private edit(componentId: string) {
    this.setState({ editComponent: of(componentId) }, this.updateUrl());
  }

  private remove(component: Component) {
    this.setState((prev, _) => {
      return { dashboard: prev.dashboard.map(dashboard => dashboard.withoutComponent(component)) };
    });
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

  private rangeChanged(range: Range) {
    this.setState((prev, _) => {
      return { dashboard: prev.dashboard.map(dashboard => dashboard.withRange(range)) };
    });
  }

  private layoutChanged(layout: Array<LayoutEntry>) {
    this.setState((prev, _) => {
      return { dashboard: prev.dashboard.map(dashboard => dashboard.withLayout(layout)) };
    });
  }
};
