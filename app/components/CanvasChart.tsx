import * as React from 'react';
import { VisualOptions, DataSource, EmbeddedDataSource, VisComponent } from 'api/model';
import { Query, QueryResult, HeroicContext, QueryRange, QueryResponse } from 'api/heroic';
import { PagesContext } from 'api/interfaces';
import { decode, equals } from 'mapping';
import Measure from 'react-measure';
import { QualitativePaired9 as QualitativePaired, ColorIterator } from 'api/colors';
import { Domain } from 'api/domain';
import { Optional } from 'optional';
import * as moment from 'moment';
import FontAwesome from 'react-fontawesome';
import * as steps from 'api/step';
import Request from 'request';

const TEXT_FONT = '16px Sans';

export interface CanvasChartModel {
  dataSource: DataSource;
  stacked: boolean;
  zeroBased: boolean;
  padding: number;
  ticksGoal: number;
  gridLineSpace: number;
}

interface State {
  queryInProgress: boolean;
  width: number;
  height: number;
}

export interface HasModel<T> {
  model: T;
}

export interface CanvasChartProps {
  visualOptions: VisualOptions;
}

export interface CanvasChartDrawState {
  width?: number;
  height?: number;

  responseRange?: QueryRange;
  result?: QueryResult[];
  cadence?: number;
  xScale?: Domain;
  yScale?: Domain;
  stacked?: boolean;
  zeroBased?: boolean;
  padding?: number;
  ticksGoal?: number;
  gridLineSpace?: number;
}

abstract class CanvasChart<
  T extends CanvasChartModel,
  P extends CanvasChartProps & HasModel<T>,
  D extends CanvasChartDrawState
  >
  extends React.Component<P, State>
  implements VisComponent {
  context: HeroicContext & PagesContext;
  canvas: HTMLCanvasElement;
  ctx?: CanvasRenderingContext2D;

  lastFetcheDataSource?: DataSource;
  currentDataSource?: EmbeddedDataSource;

  /**
   * Pending DataSource query.
   */
  dataSourceQuery?: Request<Optional<EmbeddedDataSource>>;
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

    this.next = this.initialDrawState();
    this.drawn = this.initialDrawState();

    this.state = {
      queryInProgress: true,
      width: 0,
      height: 0
    }
  }

  /**
   * Initial draw state to be implemented by extending classes.
   */
  protected abstract initialDrawState(): D;

  /**
   * Primary draw function to be implemented be extending classes.
   */
  protected abstract draw(color: ColorIterator): void;

  /**
   * Receive new props.
   */
  protected receiveProps(nextProps: P) {
    const { model } = nextProps;

    this.next.stacked = model.stacked;
    this.next.zeroBased = model.zeroBased;
    this.next.padding = model.padding;
    this.next.ticksGoal = model.ticksGoal;
    this.next.gridLineSpace = model.gridLineSpace;
  }

  public componentDidMount() {
    this.ctx = this.canvas.getContext('2d');
    this.receiveProps(this.props);
    this.refresh();
  }

  public componentWillReceiveProps(nextProps: P) {
    this.receiveProps(nextProps);
    this.refresh();
  }

  public render() {
    const { queryInProgress, width, height } = this.state;
    const { height: fixedHeight } = this.props.visualOptions;

    return (
      <Measure onMeasure={dimension => {
        this.next.width = dimension.width;
        this.next.height = fixedHeight || dimension.height;
        this.setState({ width: this.next.width, height: this.next.height }, () => {
          this.refresh();
        });
      }}>
        <div style={{ display: "block", width: "100%", height: "100%" }}>
          <div className="query-feedback">
            {queryInProgress ? <div className='in-progress'>
              <FontAwesome name='circle-o-notch' spin={true} />
            </div> : null}
          </div>

          <div style={{ display: "block", width: "100%", height: "100%" }}>
            <canvas ref={canvas => this.canvas = canvas} width={width} height={height} onMouseMove={(e: any) => this.mouseMove(e)} />
          </div>
        </div>
      </Measure >
    );
  }

  /**
   * Run a new query.
   */
  public async refresh(reload?: boolean): Promise<void> {
    const { lastFetcheDataSource } = this;
    const { model } = this.props;

    /* always wait for data source to load, if it hasn't already */
    while (this.dataSourceQuery) {
      await this.dataSourceQuery;
    }

    /* no need to refresh datasource */
    if (!equals(lastFetcheDataSource, model.dataSource)) {
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
    if (!currentDataSource || !currentDataSource.query) {
      return Promise.resolve();
    }

    /* always wait for data to load */
    while (this.dataQuery) {
      await this.dataQuery;
    }

    if (reload) {
      const range = this.props.visualOptions.range;
      const { ticksGoal } = this.next;

      const now = moment();
      const start = range.start.moment(now).valueOf();
      const end = range.end.moment(now).valueOf();

      const query = decode({
        query: currentDataSource.query,
        range: { type: 'absolute', start: start, end: end },
        options: { ticksGoal: ticksGoal }
      }, Query);

      // already updating
      if (this.dataQuery) {
        return Promise.resolve();
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

      this.next.result = result;
      this.next.cadence = response.cadence.orElseGet(() => {
        return response.result.length > 0 ? response.result[0].cadence : 0;
      });
      this.next.responseRange = response.range;
    }

    this.redraw();
    return Promise.resolve();
  }

  private mouseMove(e: any) {
    var bounds = e.target.getBoundingClientRect();
    var x = e.clientX - bounds.left;
    var y = e.clientY - bounds.top;
    return { x: x, y: y };
  }

  protected newXScale(_min: number, max: number): Domain {
    const { padding, width, responseRange } = this.next;
    const { ctx } = this;

    const exp = Math.floor(Math.log(max) / Math.log(10));
    const w = Math.pow(10, exp);
    const number = max - (max % w);

    ctx.font = TEXT_FONT;
    const labelWidth = ctx.measureText(String(number)).width;

    return new Domain(responseRange.start, responseRange.end, padding + labelWidth, width - padding);
  }

  /**
   * Check if it is time to redraw the graph.
   */
  protected checkDrawState(): boolean {
    const {
      xScale,
      yScale,
      result,
      stacked,
      zeroBased,
      padding,
      gridLineSpace
    } = this.next;

    const {
      xScale: drawnXScale,
      yScale: drawnYScale,
      result: drawnResult,
      stacked: drawnStacked,
      zeroBased: drawnZeroBased,
      padding: drawnPadding,
      gridLineSpace: drawnGridLineSpace
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

    if (result !== drawnResult) {
      this.drawn.result = result;
      redraw = true;
    }

    if (stacked !== drawnStacked) {
      this.drawn.stacked = stacked;
      redraw = true;
    }

    if (zeroBased !== drawnZeroBased) {
      this.drawn.zeroBased = zeroBased;
      redraw = true;
    }

    if (padding !== drawnPadding) {
      this.drawn.padding = padding;
      redraw = true;
    }

    if (gridLineSpace !== drawnGridLineSpace) {
      this.drawn.gridLineSpace = drawnGridLineSpace;
      redraw = true;
    }

    return redraw;
  }

  private redraw() {
    if (!this.next.result) {
      return;
    }

    const { padding, height } = this.next;
    const { min, max } = this.calcMinMax();

    // calculate scales
    this.next.xScale = this.newXScale(min, max);
    this.next.yScale = new Domain(max, min, padding, height - padding);

    if (!this.checkDrawState()) {
      return;
    }

    const color = QualitativePaired.iterate();

    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

    this.drawGrid();
    this.draw(color);
  }

  protected calcMinMax(): { min: number, max: number } {
    const { result } = this.next;
    const { stacked, zeroBased } = this.next;

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
    const { yScale, xScale, gridLineSpace } = this.next;
    const { ctx } = this;

    const step = steps.linear(yScale.scaleInverse(gridLineSpace));

    const start = (yScale.sourceMax - yScale.sourceMax % step);
    const end = yScale.sourceMin;

    ctx.fillStyle = '#888888';
    ctx.font = TEXT_FONT;

    ctx.strokeStyle = '#777777';
    ctx.lineWidth = 1;

    ctx.translate(0.5, 0.5);

    for (var i = start; i < end; i += step) {
      const y = Math.round(yScale.map(i));

      ctx.beginPath();
      ctx.moveTo(xScale.targetMin, y);
      ctx.lineTo(xScale.targetMax, y);
      ctx.stroke();

      ctx.fillText(String(i), 5, y + 6);
    }

    ctx.translate(-0.5, -0.5);
  }
};

export default CanvasChart;
