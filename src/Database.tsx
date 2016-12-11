import * as React from 'react';

import MockBackend from './backends/MockBackend';

import {Backend, PagesContext} from 'interfaces';

interface Props {
  mock: boolean;
  hello?: string;
}

export default class Database extends React.Component<Props, {}> {
  public static defaultProps: Props = {
    mock: false
  };

  public static childContextTypes: any = {
    db: React.PropTypes.object
  };

  constructor(props: Props) {
    super(props);
  }

  db(): Backend {
    return new MockBackend();
  }

  getChildContext(): PagesContext {
    return {
      db: this.db()
    };
  }

  public render() {
    const { children } = this.props;
    return <div>{children}</div>;
  }
};
