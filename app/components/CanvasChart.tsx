import * as React from 'react';
import { VisualOptions, DataSource, EmbeddedDataSource, Range } from 'api/model';
import { Query, QueryResult, HeroicContext, QueryRange, QueryResponse } from 'api/heroic';
import { PagesContext } from 'api/interfaces';
import { decode, equals } from 'mapping';
import Measure from 'react-measure';
import { QualitativePaired9 as QualitativePaired, ColorIterator } from 'api/colors';
import { Domain } from 'api/domain';
import { Optional } from 'optional';
import * as moment from 'moment';
import FontAwesome from 'react-fontawesome';

export const DEFAULT_PADDING = 10;

interface Model {
  dataSource: DataSource;
  stacked: boolean;
  zeroBased: boolean;
}

interface State {
  queryInProgress: boolean;
}

export interface CanvasChartProps<T extends Model> {
  padding?: number;
  model: T;
  visualOptions: VisualOptions;
}

export interface CanvasChartDrawState {
  width?: number;
  height?: number;
  range?: Range;
  query?: Query;

  responseRange?: QueryRange;
  result?: QueryResult[];
  cadence?: number;
  xScale?: Domain;
  yScale?: Domain;
  stacked?: boolean;
  padding: number;
}

abstract class CanvasChart<T extends Model, P extends CanvasChartProps<T>, D extends CanvasChartDrawState> extends React.Component<P, State> {
  context: HeroicContext & PagesContext;
  canvas: HTMLCanvasElement;
  ctx?: CanvasRenderingContext2D;

  lastQuery?: Query;
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

  next: D;
  drawn: D;

  public static contextTypes: any = {
    db: React.PropTypes.object,
    heroic: React.PropTypes.any
  };

  constructor(props: P) {
    super(props);

    this.next = this.initialDrawState(props);
    this.drawn = this.initialDrawState(props);

    this.state = {
      queryInProgress: true
    }
  }

  /**
   * Initial draw state to be implemented by extending classes.
   */
  abstract initialDrawState(props: P): D;

  /**
   * Primary draw function to be implemented be extending classes.
   */
  abstract draw(color: ColorIterator): void;

  /**
   * Receive new props.
   */
  protected receiveProps(nextProps: P) {
    const { model, padding, visualOptions } = nextProps;

    this.next.stacked = model.stacked;
    this.next.padding = padding || DEFAULT_PADDING;
    this.next.range = visualOptions.range;
  }

  public componentDidMount() {
    this.ctx = this.canvas.getContext('2d');
    this.componentWillReceiveProps(this.props);
  }

  public componentWillReceiveProps(nextProps: P) {
    this.receiveProps(nextProps);
    this.requery();
  }

  public render() {
    const { queryInProgress } = this.state;
    const { height: fixedHeight } = this.props.visualOptions;

    return (
      <Measure onMeasure={dimension => {
        this.next.width = dimension.width;
        this.next.height = fixedHeight || dimension.height;
        this.requery();
      }}>
        <div style={{ display: "block", width: "100%", height: "100%" }}>
          <div className="query-feedback">
            {queryInProgress ? <div className='in-progress'>
              <FontAwesome name='circle-o-notch' spin={true} />
            </div> : null}
          </div>

          <div style={{ display: "block", width: "100%", height: "100%" }}>
            <canvas ref={canvas => this.canvas = canvas} width="0" height="0" onMouseMove={(e: any) => this.mouseMove(e)} />
          </div>
        </div>
      </Measure >
    );
  }

  /**
   * Run a new query.
   */
  public async requery(force?: boolean): Promise<{}> {
    const { lastFetcheDataSource } = this;
    const { model } = this.props;

    /* no need to refresh datasource */
    if (!equals(lastFetcheDataSource, model.dataSource)) {
      /* query already in progress */
      if (this.dataSourceQuery) {
        return Promise.resolve({});
      }

      this.setState({ queryInProgress: true })

      /* also check if dataSource should be updated... */
      var dataSource;

      try {
        dataSource = await (this.dataSourceQuery = model.dataSource.toEmbedded(this.context));
      } finally {
        this.dataSourceQuery = null;
        this.setState({ queryInProgress: false })
      }

      dataSource.accept(dataSource => {
        this.lastFetcheDataSource = model.dataSource;
        this.currentDataSource = dataSource;
      });
    }

    const { currentDataSource } = this;

    // no data source loaded yet
    if (!currentDataSource) {
      return Promise.resolve({});
    }

    if (!currentDataSource.query) {
      return Promise.resolve({});
    }

    const { range } = this.next;
    const { range: drawnRange } = this.drawn;

    if (!equals(range, drawnRange) || force) {
      const now = moment();
      const start = range.start.moment(now).valueOf();
      const end = range.end.moment(now).valueOf();

      const query = decode({
        query: currentDataSource.query,
        range: { type: 'absolute', start: start, end: end }
      }, Query);

      if (!equals(query, this.lastQuery)) {
        // already updating
        if (this.dataQuery) {
          return Promise.resolve({});
        }

        this.setState({
          queryInProgress: true
        });

        var response: QueryResponse;

        try {
          response = await (this.dataQuery = this.context.heroic.queryMetrics(query));
        } finally {
          this.dataQuery = null;

          this.setState({
            queryInProgress: false
          });
        }

        const result = response.result.slice();
        result.sort((a, b) => a.hash.localeCompare(b.hash));

        this.next.query = query;
        this.next.result = result;
        this.next.cadence = response.cadence.orElse(-1);
        this.next.responseRange = response.range;

        this.drawn.range = range;
        this.lastQuery = query;
      }
    }

    this.redraw();
    return Promise.resolve({});
  }

  private mouseMove(e: any) {
    var bounds = e.target.getBoundingClientRect();
    var x = e.clientX - bounds.left;
    var y = e.clientY - bounds.top;
    return { x: x, y: y };
  }

  protected newXScale(): Domain {
    const { padding, width, responseRange } = this.next;
    return new Domain(responseRange.start, responseRange.end, padding, width - padding);
  }

  /**
   * Check if it is time to redraw the graph.
   */
  protected checkDrawState(): boolean {
    const {
      xScale,
      yScale,
      query,
      result,
      stacked,
      padding
    } = this.next;

    const {
      xScale: drawnXScale,
      yScale: drawnYScale,
      query: drawnQuery,
      result: drawnResult,
      stacked: drawnStacked,
      padding: drawnPadding,
    } = this.drawn;

    var redraw = false;

    if (!xScale.equals(drawnXScale)) {
      this.drawn.xScale = xScale;
      redraw = true;
    }

    if (!yScale.equals(drawnYScale)) {
      this.drawn.yScale = yScale;
      redraw = true;
    }

    if (!equals(query, drawnQuery)) {
      this.drawn.query = query;
      redraw = true;
    }

    if (result !== drawnResult) {
      this.drawn.result = result;
      redraw = true;
    }

    if (stacked !== drawnStacked) {
      this.drawn.stacked = stacked;
      redraw = true;
    }

    if (padding !== drawnPadding) {
      this.drawn.padding = padding;
      redraw = true;
    }

    return redraw;
  }

  private redraw() {
    if (!this.next.result) {
      return;
    }

    const { padding, width, height } = this.next;
    const { min, max } = this.calcMinMax();

    // calculate scales
    this.next.xScale = this.newXScale();
    this.next.yScale = new Domain(max, min, padding, height - padding);

    if (!this.checkDrawState()) {
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

    const { xScale, yScale, result, width, height } = this.next;
    const { ctx } = this;

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
};

export default CanvasChart;
