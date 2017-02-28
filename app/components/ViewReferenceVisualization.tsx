import React from 'react';
import { Visualization, ReferenceVisualization, VisualOptions } from 'api/model';
import { Optional, absent, of } from 'optional';
import { PagesContext } from 'api/interfaces';
import { Glyphicon } from 'react-bootstrap';

interface Props {
  visualizationReference: ReferenceVisualization;
  visualOptions: VisualOptions;
}

interface State {
  loading: boolean;
  visualization: Optional<Visualization>;
  lastId: Optional<string>;
}

export default class ViewReferenceVisualization extends React.Component<Props, State> {
  context: PagesContext;

  public static contextTypes: any = {
    db: React.PropTypes.object
  };

  constructor(props: Props) {
    super(props);

    this.state = {
      loading: true,
      visualization: absent<Visualization>(),
      lastId: absent<string>()
    };
  }

  public componentDidMount() {
    this.componentWillReceiveProps(this.props);
  }

  public componentWillReceiveProps(nextProps: Props) {
    const { lastId } = this.state;
    const { visualizationReference } = nextProps;

    if (!visualizationReference.id) {
      return;
    }

    /* do not update if ID is the same */
    if (lastId.map(id => id === visualizationReference.id).orElse(false)) {
      return;
    }

    this.setState({ loading: true }, () => {
      this.context.db.getVisualization(visualizationReference.id).then(visualization => {
        this.setState({
          loading: false,
          visualization: visualization,
          lastId: of(visualizationReference.id)
        })
      });
    });
  }

  public render() {
    const { visualizationReference, visualOptions } = this.props;
    const { loading, visualization } = this.state;

    if (!visualizationReference.id) {
      return <h4>Reference without ID</h4>;
    }

    if (loading) {
      return (
        <h4>
          <span>Loading&nbsp;&nbsp;</span>
          <Glyphicon glyph="refresh" />
        </h4>
      );
    }

    return visualization.map(v => v.renderVisual(visualOptions)).orElseGet(() => {
      return <h4>No match for reference: {visualizationReference.id}</h4>;
    });
  }
};
