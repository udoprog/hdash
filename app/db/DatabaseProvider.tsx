import * as React from 'react';

import MockDatabase from './MockDatabase';
import RealDatabase from './RealDatabase';

import { Database, PagesContext } from 'api/interfaces';

interface Props {
  mock?: boolean;
}

export default class DatabaseProvider extends React.Component<Props, {}> {
  public static defaultProps: Props = {
    mock: false
  };

  public static childContextTypes: any = {
    db: React.PropTypes.object
  };

  constructor(props: Props) {
    super(props);
  }

  db(): Database {
    if (this.props.mock) {
      return new MockDatabase();
    }

    return new RealDatabase();
  }

  getChildContext(): PagesContext {
    return {
      db: this.db()
    };
  }

  public render() {
    const { children } = this.props;
    return <div className="database-provider">{children}</div>;
  }
};
