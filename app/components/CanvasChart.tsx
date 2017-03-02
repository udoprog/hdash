import * as React from 'react';
import { VisualOptions, DataSource, EmbeddedDataSource } from 'api/model';
import { Query, QueryResult, HeroicContext, QueryRange, QueryResponse } from 'api/heroic';
import { PagesContext } from 'api/interfaces';
import { decode, equals } from 'mapping';
import Measure from 'react-measure';
import { QualitativePaired9 as QualitativePaired, ColorIterator } from 'api/colors';
import { Domain } from 'api/domain';
import { Optional } from 'optional';

interface Model {
  dataSource: DataSource;
  stacked: boolean;
  zeroBased: boolean;
}

export interface CanvasChartProps<T extends Model> {
  model: T;
  visualOptions: VisualOptions;
}

export interface CanvasChartDrawState {
  result?: QueryResult[];
  cadence?: number;
  xScale?: Domain;
  yScale?: Domain;
  stacked?: boolean;
}

abstract class CanvasChart<T extends Model, P extends CanvasChartProps<T>> extends React.Component<P, {}> {
  context: HeroicContext & PagesContext;
  canvas: HTMLCanvasElement;
  ctx?: CanvasRenderingContext2D;

  width?: number;
  height?: number;
  lastQuery?: Query;
  range?: QueryRange;
  lastFetcheDataSource?: DataSource;
  currentDataSource?: EmbeddedDataSource;

  /**
   * Pending DataSource query.
   */
  dataSourceQuery?: Promise<Optional<EmbeddedDataSource>>;
  /**
   * Pending data query.
   */
  dataQuery?: Promise<QueryResponse>;

  next: CanvasChartDrawState;
  drawn: CanvasChartDrawState;

  public static contextTypes: any = {
    db: React.PropTypes.object,
    heroic: React.PropTypes.any
  };

  constructor(props: P) {
    super(props);

    this.next = this.initialDrawState();
    this.drawn = this.initialDrawState();
  }

  /**
   * Primary draw function to be implemented be extending classes.
   */
  abstract draw(color: ColorIterator): void;

  public componentDidMount() {
    this.ctx = this.canvas.getContext('2d');
    this.componentWillReceiveProps(this.props);
    this.requery();
  }

  public componentWillReceiveProps(nextProps: P) {
    const { model } = nextProps;
    this.next.stacked = model.stacked;

    if (this.next.result) {
      this.redraw();
    }
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
          <canvas ref={canvas => this.canvas = canvas} width="0" height="0" onMouseMove={(e: any) => this.mouseMove(e)} />
        </div>
      </Measure >
    );
  }

  /**
   * Run a new query.
   */
  public async requery(): Promise<{}> {
    const { lastFetcheDataSource } = this;
    const { model } = this.props;

    /* no need to refresh datasource */
    if (equals(lastFetcheDataSource, model.dataSource)) {
      return this.maybeUpdate();
    }

    /* query already in progress */
    if (this.dataSourceQuery) {
      return Promise.resolve({});
    }

    /* also check if dataSource should be updated... */
    var dataSource;

    try {
      dataSource = await (this.dataSourceQuery = model.dataSource.toEmbedded(this.context));
    } finally {
      this.dataSourceQuery = null;
    }

    dataSource.accept(dataSource => {
      this.lastFetcheDataSource = model.dataSource;
      this.currentDataSource = dataSource;
    });

    return this.maybeUpdate();
  }

  private mouseMove(e: any) {
    var bounds = e.target.getBoundingClientRect();
    var x = e.clientX - bounds.left;
    var y = e.clientY - bounds.top;
    return { x: x, y: y };
  }

  private async maybeUpdate(): Promise<{}> {
    const { currentDataSource } = this;

    // no data source loaded yet
    if (!currentDataSource) {
      return Promise.resolve({});
    }

    // const { lastQuery } = this;

    if (!currentDataSource.query) {
      return Promise.resolve({});
    }

    const nextQuery = decode({
      query: currentDataSource.query,
      range: { type: 'relative', value: 24, unit: 'HOURS' }
    }, Query);

    return this.query(nextQuery);
  }

  private async query(query: Query): Promise<{}> {
    // already updating
    if (this.dataQuery) {
      return Promise.resolve({});
    }

    var response: QueryResponse;

    try {
      response = await (this.dataQuery = this.context.heroic.queryMetrics(query));
    } finally {
      this.dataQuery = null;
    }

    const result = response.result.slice();
    result.sort((a, b) => a.hash.localeCompare(b.hash));

    this.next.result = result;
    this.next.cadence = response.cadence;
    this.range = response.range;

    this.lastQuery = query;

    this.redraw();
    return Promise.resolve({});
  }

  protected newXScale(): Domain {
    const { width, range } = this;
    return new Domain(range.start, range.end, 10, width - 10);
  }

  private redraw() {
    const { width, height } = this;

    const { min, max } = this.calcMinMax();

    // calculate scales
    this.next.xScale = this.newXScale();
    this.next.yScale = new Domain(max, min, 10, height - 10);

    const { xScale, yScale, result, stacked } = this.next;

    var redraw = false;

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

    const ctx = this.ctx;
    ctx.canvas.width = width;
    ctx.canvas.height = height;

    const color = QualitativePaired.iterate();

    this.draw(color);
  }

  protected calcMinMax(): { min: number, max: number } {
    const { result } = this.next;
    const { stacked, zeroBased } = this.props.model;

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

  static SECONDS = 1000;
  static MINUTES = 60 * CanvasChart.SECONDS;
  static HOURS = 60 * CanvasChart.MINUTES;
  static DAYS = 24 * CanvasChart.HOURS;

  static TIME_UNITS = [
    15 * CanvasChart.SECONDS,
    30 * CanvasChart.SECONDS,
    1 * CanvasChart.MINUTES,
    2 * CanvasChart.MINUTES,
    5 * CanvasChart.MINUTES,
    15 * CanvasChart.MINUTES,
    30 * CanvasChart.MINUTES,
    1 * CanvasChart.HOURS,
    2 * CanvasChart.HOURS,
    4 * CanvasChart.HOURS,
    6 * CanvasChart.HOURS,
    12 * CanvasChart.HOURS,
    1 * CanvasChart.DAYS,
    2 * CanvasChart.DAYS,
    3 * CanvasChart.DAYS,
    5 * CanvasChart.DAYS,
    10 * CanvasChart.DAYS,
    20 * CanvasChart.DAYS
  ];

  protected drawGrid() {
    if (1 === 1) {
      return;
    }

    const { xScale, yScale, result } = this.next;
    const { ctx, width, height } = this;

    const yMid = yScale.map(0);
    const xMid = xScale.map(0);

    ctx.save();

    ctx.strokeStyle = '#cccccc';
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(0, yMid);
    ctx.lineTo(width, yMid);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(xMid, 0);
    ctx.lineTo(xMid, height);
    ctx.stroke();

    var cadence;

    var xStep = xScale.scaleInverse(20);
    var yStep = yScale.scaleInverse(40);

    /**
     * Inform the y-step using the given cadence.
     */
    if (result[0]) {
      cadence = result[0].cadence;

      while (cadence < xStep) {
        cadence *= 2;
      }

      xStep = cadence;
    }

    const xStart = xScale.sourceMin - xScale.sourceMin % xStep;
    const xEnd = xScale.sourceMax + (xScale.sourceMax - xScale.sourceMax % cadence);

    const yStart = yScale.sourceMin - yScale.sourceMin % Math.abs(yStep);
    const yEnd = yScale.sourceMax + (yScale.sourceMax - yScale.sourceMax % Math.abs(yStep));

    ctx.strokeStyle = '#cccccc';
    ctx.lineWidth = 2;

    for (var i = xStart; i < xEnd; i += cadence) {
      const x = xScale.map(i);

      ctx.beginPath();
      ctx.moveTo(x, yScale.map(yStart));
      ctx.lineTo(x, yScale.map(yEnd));
      ctx.stroke();
    }

    ctx.strokeStyle = '#cccccc';
    ctx.lineWidth = 2;

    for (var i = yStart; i > yEnd; i += yStep) {
      const y = yScale.map(i);

      ctx.beginPath();
      ctx.moveTo(xScale.map(xStart), y);
      ctx.lineTo(xScale.map(xEnd), y);
      ctx.stroke();
    }

    ctx.restore();
  }

  /**
   * Initial draw state to be implemented by extending classes.
   */
  private initialDrawState(): CanvasChartDrawState {
    return {};
  }
};

export default CanvasChart;
