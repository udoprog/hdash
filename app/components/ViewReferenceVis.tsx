import React from 'react';
import { Vis, ReferenceVis, VisualOptions } from 'api/model';
import { Optional, absent, of } from 'optional';
import { PagesContext } from 'api/interfaces';
import FontAwesome from 'react-fontawesome';

interface Props {
  vis: ReferenceVis;
  visualOptions: VisualOptions;
}

interface State {
  loading: boolean;
  visualization: Optional<Vis>;
  lastId: Optional<string>;
}

export default class ViewReferenceVis extends React.Component<Props, State> {
  context: PagesContext;

  public static contextTypes: any = {
    db: React.PropTypes.object
  };

  constructor(props: Props) {
    super(props);

    this.state = {
      loading: true,
      visualization: absent<Vis>(),
      lastId: absent<string>()
    };
  }

  public componentDidMount() {
    this.componentWillReceiveProps(this.props);
  }

  public componentWillReceiveProps(nextProps: Props) {
    const { lastId } = this.state;
    const { vis } = nextProps;

    if (!vis.id) {
      return;
    }

    /* do not update if ID is the same */
    if (lastId.map(id => id === vis.id).orElse(false)) {
      return;
    }

    this.setState({ loading: true }, () => {
      this.context.db.getVisualization(vis.id).then(visualization => {
        this.setState({
          loading: false,
          visualization: visualization,
          lastId: of(vis.id)
        })
      });
    });
  }

  public render() {
    const { vis, visualOptions } = this.props;
    const { loading, visualization } = this.state;

    if (!vis.id) {
      return (
        <div style={{ height: visualOptions.height }} className="loading">
          Reference without ID
        </div>
      );
    }

    if (loading) {
      return (
        <div style={{ height: visualOptions.height }} className="loading">
          <span>Loading Ref</span>
          <span>&nbsp;&nbsp;</span>
          <FontAwesome name="circle-o-notch" spin={true} />
        </div>
      );
    }

    return visualization.map(v => v.renderVisual(visualOptions)).orElseGet(() => {
      return (
        <div style={{ height: visualOptions.height }} className="loading">
          <span>No match for reference:</span><br />
          <b>{vis.id}</b>
        </div>
      );
    });
  }
};
