import * as React from 'react';
import * as model from 'api/model';
import { LineChart, XAxis, Tooltip, CartesianGrid, Line, ResponsiveContainer } from 'recharts';
import { Optional, absent, of } from 'optional';
import { PagesContext } from 'api/interfaces';

const DATA: any[] = [
  { name: "1", uv: 100, pv: 200 },
  { name: "2", uv: 121, pv: 231 },
  { name: "3", uv: 99, pv: 312 }
];

interface Props {
  height: number;
  visualization: model.VisualizationReference | model.Visualization;
}

interface State {
  visualization: Optional<model.Visualization>;
}

export default class Visualization extends React.Component<Props, State> {
  context: PagesContext;

  public static contextTypes: any = {
    db: React.PropTypes.object
  };

  constructor(props: Props) {
    super(props);

    this.state = {
      visualization: absent<model.Visualization>()
    };
  }

  public componentDidMount() {
    const { visualization } = this.props;

    if (visualization instanceof model.VisualizationReference) {
      this.context.db.getVisualization(visualization.id).then(visualization => {
        this.setState({ visualization: visualization })
      });
    } else {
      this.setState({ visualization: of(visualization) });
    }
  }

  public render() {
    const { height } = this.props;

    return (
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={DATA}>
          <XAxis dataKey="name" />
          <Tooltip />
          <CartesianGrid stroke="#f5f5f5" />
          <Line type="monotone" dataKey="uv" stroke="#ff7300" yAxisId={0} />
          <Line type="monotone" dataKey="pv" stroke="#387908" yAxisId={1} />
        </LineChart>
      </ResponsiveContainer>
    );
  }
};
