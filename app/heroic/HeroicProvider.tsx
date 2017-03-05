import * as React from 'react';
import { Heroic, HeroicContext } from 'api/heroic';
import RealHeroic from './RealHeroic';

interface Props {
}

export default class DatabaseProvider extends React.Component<Props, {}> {
  public static childContextTypes: any = {
    heroic: React.PropTypes.object
  };

  constructor(props: Props) {
    super(props);
  }

  heroic(): Heroic {
    return new RealHeroic("/heroic");
  }

  getChildContext(): HeroicContext {
    return {
      heroic: this.heroic()
    };
  }

  public render() {
    const { children } = this.props;
    return <div className="heroic-provider">{children}</div>;
  }
};
