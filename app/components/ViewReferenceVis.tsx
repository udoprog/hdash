import * as React from 'react';
import { Vis, ReferenceVis, VisualOptions, VisComponent } from 'api/model';
import { Optional, absent } from 'optional';
import { PagesContext } from 'api/interfaces';
import FontAwesome from 'react-fontawesome';
import Request from 'request';

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
  visQuery?: Request<Optional<Vis>>;

  public static contextTypes: any = {
    db: React.PropTypes.object
  };

  public componentWillUnmount() {
    if (this.visQuery) {
      this.visQuery.cancel();
      this.visQuery = null;
    }
  }

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

  public async refresh(query: boolean): Promise<void> {
    const { vis } = this.props;
    const { db } = this.context;

    if (!vis.id) {
      return;
    }

    while (this.visQuery) {
      await this.visQuery;
    }

    /* do not update if ID is the same */
    if (!this.visual) {
      this.setState({ loading: true });

      let v: Optional<Vis>;

      try {
        v = await (this.visQuery = db.getVisualization(vis.id));
      } catch (e) {
        if (e === Request.CANCELLED) {
          return Promise.resolve();
        }

        await new Promise((_, reject) => {
          this.setState({ loading: false }, () => reject(e));
        });
      } finally {
        this.visQuery = null;
      }

      await new Promise((resolve, reject) => {
        this.setState({ loading: false, visualization: v }, () => {
          v.accept(resolve, () => {
            reject(new Error(`no visualization with id '${vis.id}'`));
          })
        });
      });
    }

    if (!this.visual) {
      return Promise.resolve();
    }

    return this.visual.refresh(query);
  }
};
