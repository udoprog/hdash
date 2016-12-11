import * as React from 'react';

import {DashboardData} from 'interfaces';
import {PagesContext, RouterContext} from 'interfaces';

interface DashboardProps {
  params: {
    id: string
  }
}

interface DashboardState {
  dashboard?: DashboardData
}

export default class Dashboard extends React.Component<DashboardProps, DashboardState> {
  context: PagesContext;

  public static contextTypes: any = {
    db: React.PropTypes.object
  };

  constructor(props) {
    super(props);

    this.state = {
      dashboard: null
    };
  }

  public componentDidMount(): void {
    this.context.db.get(this.props.params.id).then(dashboard => {
      this.setState({dashboard: dashboard});
    });
  }

  public render() {
    const {dashboard} = this.state;

    let title = dashboard === null ? `Dashboard w/ id ${this.props.params.id}` : dashboard.title;

    return (
      <div>
        <h1>{title}</h1>
      </div>
    );
  }
};
