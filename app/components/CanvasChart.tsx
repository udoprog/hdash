import * as React from 'react';
import { VisualOptions, DataSource, EmbeddedDataSource } from 'api/model';
import { Query, QueryResult, HeroicContext, QueryRange } from 'api/heroic';
import { PagesContext } from 'api/interfaces';
import { decode, equals } from 'mapping';
import Measure from 'react-measure';
import { QualitativePaired9 as QualitativePaired, ColorIterator } from 'api/colors';
import { Domain } from 'api/domain';

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
  xScale?: Domain;
  yScale?: Domain;
  stacked?: boolean;
}

abstract class CanvasChart<T extends Model, P extends CanvasChartProps<T>, D extends CanvasChartDrawState> extends React.Component<P, {}> {
  context: HeroicContext & PagesContext;
  ctx?: CanvasRenderingContext2D;

  width?: number;
  height?: number;
  lastQuery?: Query;
  range?: QueryRange;
  lastQueriedDataSource?: DataSource;
  currentDataSource?: EmbeddedDataSource;

  /**
   * Pending DataSource query.
   */
  dataSourceQuery?: Promise<void>;
  /**
   * Pending data query.
   */
  dataQuery?: Promise<void>;

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
  }

  refs: {
    canvas: HTMLCanvasElement;
  }

  abstract initialDrawState(): D;

  public componentDidMount() {
    const { canvas } = this.refs;
    this.ctx = canvas.getContext('2d');

    this.componentWillReceiveProps(this.props);
  }

  public componentWillReceiveProps(nextProps: P) {
    const { model } = nextProps;
    const { lastQueriedDataSource } = this;

    this.next.stacked = model.stacked;

    if (equals(lastQueriedDataSource, model.dataSource)) {
      this.maybeUpdate();
      return;
    }

    /* query already in progress */
    if (this.dataSourceQuery) {
      return;
    }

    /* also check if dataSource should be updated... */
    this.dataSourceQuery = model.dataSource.toEmbedded(this.context).then(dataSource => {
      dataSource.accept(dataSource => {
        this.lastQueriedDataSource = model.dataSource;
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
    return { x: x, y: y };
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

    const ctx = this.ctx;
    const { width, height } = this;

    ctx.canvas.width = width;
    ctx.canvas.height = height;

    const color = QualitativePaired.iterate();

    this.draw(color);
  }

  abstract draw(color: ColorIterator): void;

  private calcMinMax(result: QueryResult[]): { min: number, max: number } {
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
};

export default CanvasChart;
