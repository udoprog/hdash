import * as React from 'react';
import { Vis, ReferenceVis, VisualOptions, VisComponent } from 'api/model';
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
}

export default class ViewReferenceVis extends React.Component<Props, State> implements VisComponent {
  context: PagesContext;
  visual?: VisComponent;
  visQuery?: Promise<Optional<Vis>>;

  public static contextTypes: any = {
    db: React.PropTypes.object
  };

  constructor(props: Props) {
    super(props);

    this.state = {
      loading: true,
      visualization: absent<Vis>()
    };
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

    return visualization.map(v => v.renderVisual(visualOptions, visual => this.visual = visual)).orElseGet(() => {
      return (
        <div style={{ height: visualOptions.height }} className="loading">
          <span>No match for reference:</span><br />
          <b>{vis.id}</b>
        </div>
      );
    });
  }

  public async refresh(query: boolean): Promise<{}> {
    const { vis } = this.props;

    if (!vis.id) {
      return;
    }

    /* do not update if ID is the same */
    if (!this.visual) {
      while (this.visQuery) {
        await this.visQuery;
      }

      await new Promise((resolve, _) => this.setState({ loading: true }, resolve));

      var visualization: Optional<Vis> = null;

      try {
        visualization = await (this.visQuery = this.context.db.getVisualization(vis.id));
      } finally {
        this.visQuery = null;
      }

      await visualization.map(visualization => {
        return new Promise((resolve, _) => this.setState({
          loading: false,
          visualization: of(visualization)
        }, resolve));
      }).orElseGet(() => {
        return Promise.reject(new Error('no visualization found for id'));
      });
    }

    if (this.visual) {
      return this.visual.refresh(query);
    }

    return Promise.resolve({});
  }
};
