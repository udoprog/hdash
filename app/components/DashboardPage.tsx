import * as React from 'react';
import { Grid, Navbar, Nav, NavItem, ButtonGroup, Button, Badge, ListGroup, ListGroupItem } from 'react-bootstrap';
import FontAwesome from 'react-fontawesome';
import { PagesContext, RouterContext } from 'api/interfaces';
import { Dashboard, Component, LayoutEntry, Range, VisualOptions, VisComponent } from 'api/model';
import { Optional, absent, of, ofNullable } from 'optional';
import ReactGridLayout from 'react-grid-layout';
import EditComponent from 'components/EditComponent';
import { RouteComponentProps } from 'react-router';
import RangePicker from 'components/RangePicker';
import * as moment from 'moment';

const ResponsiveReactGridLayout = ReactGridLayout.WidthProvider(ReactGridLayout);

const ROW_HEIGHT = 150;

interface Params {
  id: string
}

interface ErrorContext {
  message: string;
  error: Error;
  timestamp: moment.Moment;
}

interface Props extends RouteComponentProps<Params, {}> {
}

interface SuccessQueryResult {
  type: 'success';
}

interface ErrorQueryResult {
  type: 'error';
  error: Error;
}

type QueryResult = SuccessQueryResult | ErrorQueryResult;

interface State {
  locked: boolean;
  dashboard: Optional<Dashboard>;
  editComponent: Optional<string>;
  editRange: boolean;
  showErrors: boolean;
  queryInProgress: boolean;
  errors: ErrorContext[];
}

export default class DashboardPage extends React.Component<Props, State> {
  context: PagesContext & RouterContext;
  /**
   * Collection of components in view.
   */
  visuals: { [key: string]: VisComponent };
  /**
   * When focusing on a single component.
   */
  visual?: VisComponent;
  queryInProgress: Promise<QueryResult[]>;

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
      showErrors: query.showErrors === 'true',
      queryInProgress: false,
      errors: [],
    };

    this.visuals = {};
  }

  public componentDidMount(): void {
    this.context.db.get(this.props.params.id).then(dashboard => {
      this.setState({ dashboard: dashboard }, () => this.query());
    });
  }

  private updateUrl(): void {
    const { locked, editComponent, editRange, showErrors } = this.state;
    const { pathname, query } = this.props.location;
    const { router } = this.context;

    query.unlocked = !locked ? 'true' : undefined;
    query.edit = editComponent.orElse(undefined);
    query.editRange = editRange ? 'true' : undefined;
    query.showErrors = showErrors ? 'true' : undefined;

    router.replace({
      pathname: pathname,
      query: query
    });
  }

  public render() {
    const { locked, dashboard, editComponent, editRange, showErrors, queryInProgress, errors } = this.state;

    let title = dashboard
      .map(dashboard => dashboard.title)
      .orElse(`Dashboard with ID '${this.props.params.id}' does not exist`);

    const errorsToggle = (
      <NavItem onClick={() => this.setState({ showErrors: !showErrors }, () => this.updateUrl())} active={showErrors}>
        <FontAwesome name="error" />
        <span className='icon-text'>Errors</span>
        <Badge className='icon-text'>{errors.length}</Badge>
      </NavItem>
    );

    const rangeToggle = (
      <NavItem onClick={() => this.setState({ editRange: !editRange }, () => this.updateUrl())} active={editRange}>
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

    const showErrorsComponent = showErrors ? (
      <Grid className='range-picker-menu'>
        <ListGroup>
          {errors.map((error, index) => {
            if (index > 3) {
              return false;
            }

            return (
              <ListGroupItem>
                <h4>{error.message} as {error.timestamp.format()}</h4>
                <pre><code>{error.error.stack}</code></pre>
              </ListGroupItem>
            );
          })}
        </ListGroup>
      </Grid>
    ) : null;

    const lockToggle = (
      <NavItem title={locked ? "Unlock to Edit" : "Lock"} onClick={() => this.setState({ locked: !locked }, () => {
        this.updateUrl();
        this.query();
      })}>
        <FontAwesome name={locked ? 'wrench' : 'lock'} />
        <span className='icon-text'>{locked ? "Unlock" : "Lock"}</span>
      </NavItem>
    );

    const addComponent = !locked ? (
      <NavItem onClick={() => this.addComponent()}>
        <FontAwesome name="plus" />
        <span className='icon-text'>Add Component</span>
      </NavItem>
    ) : null;

    const save = !locked ? (
      <NavItem onClick={() => this.save()}>
        <FontAwesome name="save" />
        <span className='icon-text'>Save</span>
      </NavItem>
    ) : null;

    const query = queryInProgress ? (
      <NavItem onClick={() => this.query()} disabled={true}>
        <FontAwesome name='circle-o-notch' spin={true} />
        <span className='icon-text'>Query</span>
      </NavItem>
    ) : (
        <NavItem onClick={() => this.query()}>
          <FontAwesome name="play" />
          <span className='icon-text'>Query</span>
        </NavItem>
      );

    const main = dashboard.map(dashboard => {
      return editComponent.map(componentId => {
        return dashboard.getComponent(componentId).map(component => {
          return (
            <EditComponent
              component={component}
              range={dashboard.range}
              onBack={(component) => this.back(component)}
              ref={visual => this.visual = visual} />
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
          <Nav>
            {lockToggle}
            {save}
            {addComponent}
          </Nav>

          <Nav pullRight>
            {errorsToggle}
            {query}
            {rangeToggle}
          </Nav>
        </Navbar>

        <div>
          {showErrorsComponent}
        </div>

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
                <FontAwesome name="edit" />
              </Button>

              <Button bsStyle="danger" onClick={() => this.remove(component)}>
                <FontAwesome name="remove" />
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
          {component.visualization.renderVisual(visualOptions, ref => this.visuals[component.id] = ref)}
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
    }, () => {
      this.updateUrl();
      this.query();
    });
  }

  private edit(componentId: string) {
    this.setState({ editComponent: of(componentId) }, () => this.updateUrl());
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

  private query() {
    this.queryAsync().then((result: QueryResult[]) => {
      result.forEach(r => {
        if (r.type === 'error') {
          this.setState(prev => {
            return {
              errors: [{
                message: 'Issue when running query',
                error: r.error,
                timestamp: moment()
              }].concat(prev.errors)
            };
          })
        }
      })
    }, error => {
      this.setState(prev => {
        return {
          errors: [{
            message: 'Issue in query batch',
            error: error,
            timestamp: moment()
          }].concat(prev.errors)
        };
      })
    });
  }

  private async queryAsync(): Promise<QueryResult[]> {
    if (this.queryInProgress) {
      return Promise.resolve([]);
    }

    var promise: Promise<QueryResult[]>;

    if (this.visual) {
      promise = this.visual.refresh(true).then(result => {
        return [{ result: result }];
      }, error => {
        return [{ error: error }];
      });
    } else {
      promise = Promise.all(Object.keys(this.visuals).map<Promise<QueryResult>>(key => {
        return this.visuals[key].refresh(true).then(result => {
          return { type: 'success', result: result };
        }, error => {
          return { type: 'error', error: error };
        });
      }));
    }

    let result;

    try {
      result = await (this.queryInProgress = promise);
    } finally {
      this.queryInProgress = null;
    }

    return Promise.resolve(result);
  }

  private addComponent() {
    this.setState((prev, _) => {
      return { dashboard: prev.dashboard.map(dashboard => dashboard.withNewComponent()) };
    });
  }

  private rangeChanged(range: Range) {
    this.setState((prev, _) => {
      return { dashboard: prev.dashboard.map(dashboard => dashboard.withRange(range)), editRange: false };
    }, () => {
      this.query();
    });
  }

  private layoutChanged(layout: Array<LayoutEntry>) {
    this.setState((prev, _) => {
      return { dashboard: prev.dashboard.map(dashboard => dashboard.withLayout(layout)) };
    });
  }
};
