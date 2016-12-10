import * as React from 'react';
import {Link} from 'react-router';

import {PagesContext} from 'interfaces';

interface DashboardsProps {
  route: {
    test: string
  }
}

interface DashboardsState {
  dashboards: Array<any>
}

export default class Dashboards extends React.Component<DashboardsProps, DashboardsState> {
  context: PagesContext;

  public static contextTypes: any = {
    db: React.PropTypes.object
  };

  constructor(props) {
    super(props);

    this.state = {
      dashboards: []
    };
  }

  public componentDidMount(): void {
    this.context.db.search().then(result => {
      this.setState({dashboards: result});
    }, reason => {
      console.log(reason);
    });
  }

  public render(): JSX.Element {
    return (
      <div>
        <h1>Dashboards</h1>
        {this.state.dashboards.map((d, i) => {
          return <p key={i}><Link to={`/dashboard/${d.id}`}>{d.title}</Link></p>;
        })}
      </div>
    );
  }
};
