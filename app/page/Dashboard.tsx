import * as React from 'react';

import { DashboardData } from 'api/interfaces';
import { PagesContext } from 'api/interfaces';
import { Optional, absent } from 'optional';

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

    return (
      <div>
        <h1>{title}</h1>
      </div>
    );
  }
};
