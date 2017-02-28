import React from 'react';
import { LineChart, VisualOptions, DataSource, EmbeddedDataSource } from 'api/model';
import { Query, QueryResult, HeroicContext, QueryRange } from 'api/heroic';
import { PagesContext } from 'api/interfaces';
import { decode, equals } from 'mapping';
import Measure from 'react-measure';
import { QualitativePaired9 as QualitativePaired } from 'api/colors';
import { Domain } from 'api/domain';

interface Props {
  lineChart: LineChart;
  visualOptions: VisualOptions;
}

interface DrawState {
  result?: QueryResult[];
  xScale?: Domain;
  yScale?: Domain;
  stacked?: boolean;
}

export default class ViewLineChart extends React.Component<Props, {}> {
  context: HeroicContext & PagesContext;
  ctx?: CanvasRenderingContext2D;

  width?: number;
  height?: number;
  lastQuery?: Query;
  range?: QueryRange;
  lastQueriedDataSource?: DataSource;
  currentDataSource?: EmbeddedDataSource;
  dataSourceQuery?: Promise<void>;
  dataQuery?: Promise<void>;

  next: DrawState;
  drawn: DrawState;

  public static contextTypes: any = {
    db: React.PropTypes.object,
    heroic: React.PropTypes.any
  };

  constructor(props: Props) {
    super(props);

    this.next = {};
    this.drawn = {};
  }

  refs: {
    canvas: HTMLCanvasElement;
  }

  public componentDidMount() {
    const { canvas } = this.refs;
    this.ctx = canvas.getContext('2d');

    this.componentWillReceiveProps(this.props);
  }

  public componentWillReceiveProps(nextProps: Props) {
    const { lineChart } = nextProps;
    const { lastQueriedDataSource } = this;

    this.next.stacked = lineChart.stacked;

    if (equals(lastQueriedDataSource, lineChart.dataSource)) {
      this.maybeUpdate();
      return;
    }

    /* query already in progress */
    if (this.dataSourceQuery) {
      return;
    }

    /* also check if dataSource should be updated... */
    this.dataSourceQuery = lineChart.dataSource.toEmbedded(this.context).then(dataSource => {
      dataSource.accept(dataSource => {
        this.lastQueriedDataSource = lineChart.dataSource;
        this.currentDataSource = dataSource;
        this.dataSourceQuery = null;
        this.maybeUpdate();
      })
    });
  }

  public render() {
    const { height: fixedHeight } = this.props.visualOptions;

    return (
      <Measure onMeasure={dimension => {
        this.width = dimension.width;
        this.height = fixedHeight || dimension.height;
        this.maybeUpdate();
      }}>
        <div style={{ display: "block", width: "100%", height: "100%" }}>
          <canvas ref="canvas" width="0" height="0" onMouseMove={(e: any) => this.mouseMove(e)} />
        </div>
      </Measure >
    );
  }

  private mouseMove(e: any) {
    var bounds = e.target.getBoundingClientRect();
    var x = e.clientX - bounds.left;
    var y = e.clientY - bounds.top;
    return {x: x, y: y};
  }

  private maybeUpdate() {
    const { currentDataSource } = this;

    // no data source loaded yet
    if (!currentDataSource) {
      return;
    }

    const { lastQuery } = this;

    const nextQuery = decode({
      query: currentDataSource.query,
      range: { type: 'relative', value: 24, unit: 'HOURS' }
    }, Query);

    if (equals(nextQuery, lastQuery)) {
      this.redrawScales();
      return;
    }

    // already updating
    if (this.dataQuery) {
      return;
    }

    this.dataQuery = this.context.heroic.queryMetrics(nextQuery).then(response => {
      const result = response.result.slice();
      result.sort((a, b) => a.hash.localeCompare(b.hash));

      this.next.result = result;
      this.range = response.range;

      this.lastQuery = nextQuery;
      this.dataQuery = null;

      this.redrawScales();
    }, () => {
      this.dataQuery = null;
    });
  }

  private redrawScales() {
    const { width, height, range } = this;
    const { result } = this.next;

    const { min, max } = this.calcMinMax(result);

    // calculate scales
    this.next.xScale = new Domain(range.start, range.end, 10, width - 10);
    this.next.yScale = new Domain(max, min, 10, height - 10);

    this.redraw();
  }

  private redraw() {
    var redraw = false;

    const {xScale, yScale, result, stacked} = this.next;

    const {
      xScale: drawnXScale,
      yScale: drawnYScale,
      result: drawnResult,
      stacked: drawnStacked
    } = this.drawn;

    if (!xScale.equals(drawnXScale)) {
      this.drawn.xScale = xScale;
      redraw = true;
    }

    if (!yScale.equals(drawnYScale)) {
      this.drawn.yScale = yScale;
      redraw = true;
    }

    if (stacked !== drawnStacked) {
      this.drawn.stacked = stacked;
      redraw = true;
    }

    if (result !== drawnResult) {
      this.drawn.result = result;
      redraw = true;
    }

    if (!redraw) {
      return;
    }

    const { width, height } = this;

    const ctx = this.ctx;

    ctx.canvas.width = width;
    ctx.canvas.height = height;

    const color = QualitativePaired.iterate();

    var mover = (x: number, y: number) => {
      ctx.moveTo(xScale.scale(x), yScale.scale(y));
    };

    var drawer = (x: number, y: number) => {
      ctx.lineTo(xScale.scale(x), yScale.scale(y));
    };

    if (stacked) {
      // keep track of floors
      const floors: { [key: number]: number } = {};

      const originalMover = mover;
      const originalDrawer = drawer;

      mover = (x: number, y: number) => {
        y = floors[x] = (floors[x] || 0) + y;
        originalMover(x, y);
      }

      drawer = (x: number, y: number) => {
        y = floors[x] = (floors[x] || 0) + y;
        originalDrawer(x, y);
      }
    }

    for (var i = 0, l = result.length; i < l; i++) {
      const d = result[i].values;

      if (d.length <= 0) {
        continue;
      }

      const [o0, v0] = d[0];

      ctx.beginPath();
      ctx.strokeStyle = color.next();

      mover(o0, v0);

      for (var di = 1, dl = d.length; di < dl; di++) {
        const [o, v] = d[di];
        drawer(o, v);
      }

      ctx.stroke();
    }
  }

  private calcMinMax(result: QueryResult[]): { min: number, max: number } {
    const { stacked, zeroBased } = this.props.lineChart;

    const floors: { [key: number]: number } = {};

    var min: number | null = !!zeroBased ? 0 : null;
    var max: number | null = null;

    for (var i = 0, l = result.length; i < l; i++) {
      const d = result[i].values;

      for (var di = 0, dl = d.length; di < dl; di++) {
        var [x, y] = d[di];

        if (stacked) {
          y = floors[x] = (floors[x] || 0) + y;
        }

        min = (min !== null ? (y < min ? y : min) : y);
        max = (max !== null ? (y > max ? y : max) : y);
      }
    }

    return { min: min, max: max };
  }
};
