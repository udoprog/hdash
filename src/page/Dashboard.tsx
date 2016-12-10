import * as React from 'react';

interface Props {
  params: any
}

export default class Dashboard extends React.Component<Props, {}> {
  public render() {
    return (
      <h1>Dashboard: {this.props.params.id}</h1>
    );
  }
};
