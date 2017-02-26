import * as React from 'react';
import { Grid } from 'react-bootstrap';
import { DashboardData, PagesContext } from 'api/interfaces';
import { Optional, absent } from 'optional';
import ReactGridLayout from 'react-grid-layout';

const ResponsiveReactGridLayout = ReactGridLayout.WidthProvider(ReactGridLayout);

interface Props {
  params: {
    id: string
  }
}

interface State {
  dashboard: Optional<DashboardData>
}

export default class Dashboard extends React.Component<Props, State> {
  context: PagesContext;

  public static contextTypes: any = {
    db: React.PropTypes.object
  };

  constructor(props: Props) {
    super(props);

    this.state = {
      dashboard: absent<DashboardData>()
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

    var layout = [
      { i: 'a', x: 0, y: 0, w: 1, h: 2 },
      { i: 'b', x: 1, y: 0, w: 3, h: 2, minW: 2, maxW: 4 },
      { i: 'c', x: 4, y: 0, w: 1, h: 2 }
    ];

    return (
      <Grid fluid={true}>
        <h1>{title}</h1>

        <ResponsiveReactGridLayout className="layout" layout={layout} cols={12} measureBeforeMount={true} onLayoutChange={(layout: any) => this.layoutChanged(layout)}>
          <div className="component" key={'a'}>a</div>
          <div className="component" key={'b'}>b</div>
          <div className="component" key={'c'}>c</div>
        </ResponsiveReactGridLayout>
      </Grid>
    );
  }

  private layoutChanged(layout: any) {
    console.log(layout);
  }
};
