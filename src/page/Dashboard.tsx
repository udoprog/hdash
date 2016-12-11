import * as React from 'react';

interface DashboardProps {
  params: {
    id: string
  }
}

interface DashboardState {
}

export default class Dashboard extends React.Component<DashboardProps, DashboardState> {
  constructor(props) {
    super(props);
    this.state = {};
  }

  public render() {
    return (
      <div>
        <h1>Dashboard: {this.props.params.id}</h1>
      </div>
    );
  }
};
