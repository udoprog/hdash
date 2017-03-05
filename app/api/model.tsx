import * as React from 'react';
import { decode, field, clone, types, Constructor, Values } from 'mapping';
import { Optional, ofNullable, of } from 'optional';
import EditBarChart from 'components/EditBarChart';
import ViewBarChart from 'components/ViewBarChart';
import EditLineChart from 'components/EditLineChart';
import ViewLineChart from 'components/ViewLineChart';
import ViewReferenceVis from 'components/ViewReferenceVis';
import EditReferenceVis from 'components/EditReferenceVis';

import EditEmbeddedDataSource from 'components/EditEmbeddedDataSource';
import EditReferenceDataSource from 'components/EditReferenceDataSource';
import { CanvasChartModel } from 'components/CanvasChart';

import { PagesContext } from 'api/interfaces';
import { Instant, InstantType } from './instant';

const MAX_ATTEMPTS = 1000;
const RANGE = 1000000;

var randomId = Math.round(Math.random() * RANGE);

/**
 * A range that has an exact starting and stopping.
 */
export class Range {
  @field(InstantType)
  public readonly start: Instant;
  @field(InstantType)
  public readonly end: Instant;

  constructor(values: Values<Range>) {
    this.start = values.start;
    this.end = values.end;
  }

  equals(other: Range): boolean {
    return (
      other.start.equals(this.start) &&
      other.end.equals(this.end)
    );
  }
}

export interface VisComponent {
  refresh(query?: boolean): Promise<{}>;
}

export interface VisualOptions {
  height?: number;
  range: Range;
}

export interface DataSource {
  renderEdit(onChange: (model: this) => void): any;

  toEmbedded(context: PagesContext): Promise<Optional<EmbeddedDataSource>>;
}

export class EmbeddedDataSource implements DataSource {
  static type = 'embedded';
  static font = 'database';
  static description = 'Embedded';

  get type(): string {
    return EmbeddedDataSource.type;
  }

  @field(types.String)
  readonly query: string;

  constructor(values: Values<EmbeddedDataSource>) {
    this.query = values.query;
  }

  renderEdit(onChange: (model: EmbeddedDataSource) => void): any {
    return (
      <EditEmbeddedDataSource dataSource={this} onChange={onChange} />
    );
  }

  toEmbedded(_context: PagesContext): Promise<Optional<EmbeddedDataSource>> {
    return Promise.resolve(of(this));
  }
}

export class ReferenceDataSource implements DataSource {
  static type = 'reference';
  static font = 'link';
  static description = 'Reference';

  get type(): string {
    return ReferenceDataSource.type;
  }

  @field(types.String)
  readonly id: string;

  constructor(values: Values<ReferenceDataSource>) {
    this.id = values.id;
  }

  renderEdit(onChange: (model: ReferenceDataSource) => void): any {
    return (
      <EditReferenceDataSource dataSource={this} onChange={onChange} />
    );
  }

  toEmbedded(context: PagesContext): Promise<Optional<EmbeddedDataSource>> {
    return context.db.getDataSource(this.id);
  }
}

export const DataSourceType = types.SubTypes<DataSource>([
  EmbeddedDataSource,
  ReferenceDataSource
]);

export const DEFAULT_EMBEDDED_DATA_SOURCE = decode({
  query: ""
}, EmbeddedDataSource);

export const DEFAULT_REFERENCE_DATA_SOURCE = decode({
  id: ""
}, ReferenceDataSource);

export interface Vis {
  typeTitle(): string;

  renderEdit(onChange: (model: this) => void): any;

  renderVisual(onChange: VisualOptions, ref?: (visual: VisComponent) => void): any;
}

export class LineChart implements CanvasChartModel, Vis {
  static type = 'line-chart';
  static font = 'line-chart';
  static description = 'Line Chart';

  get type(): string {
    return LineChart.type;
  }

  @field(types.Boolean)
  stacked: boolean;
  @field(types.Boolean)
  zeroBased: boolean;
  @field(types.Number)
  padding: number;
  @field(types.Number)
  ticksGoal: number;
  @field(types.Number)
  gridLineSpace: number;
  @field(DataSourceType)
  dataSource: DataSource & HasType;

  constructor(values: Values<LineChart>) {
    this.stacked = values.stacked;
    this.zeroBased = values.zeroBased;
    this.padding = values.padding;
    this.ticksGoal = values.ticksGoal;
    this.gridLineSpace = values.gridLineSpace;
    this.dataSource = values.dataSource;
  }

  typeTitle(): string {
    return "Line Chart";
  }

  renderEdit(onChange: (model: LineChart) => void): any {
    return (
      <EditLineChart lineChart={this} onChange={onChange} />
    );
  }

  renderVisual(onChange: VisualOptions, ref?: (visual: VisComponent) => void) {
    return <ViewLineChart model={this} visualOptions={onChange} ref={ref} />;
  }
}

export class BarChart implements Vis {
  static type = 'bar-chart';
  static font = 'bar-chart';
  static description = 'Bar Chart';

  get type(): string {
    return BarChart.type;
  }

  zeroBased: boolean;

  @field(types.Boolean)
  stacked: boolean;
  @field(types.Number)
  padding: number;
  @field(types.Number)
  ticksGoal: number;
  @field(types.Number)
  gridLineSpace: number;
  @field(types.Number)
  gap: number;
  @field(DataSourceType)
  dataSource: DataSource & HasType;

  constructor(values: Values<BarChart>) {
    this.zeroBased = true;
    this.stacked = values.stacked;
    this.padding = values.padding;
    this.ticksGoal = values.ticksGoal;
    this.gridLineSpace = values.gridLineSpace;
    this.gap = values.gap;
    this.dataSource = values.dataSource;
  }

  typeTitle(): string {
    return "Bar Chart";
  }

  renderEdit(onChange: (model: BarChart) => void) {
    return (
      <EditBarChart barChart={this} onChange={onChange} />
    );
  }

  renderVisual(onChange: VisualOptions, ref?: (visual: VisComponent) => void): any {
    return <ViewBarChart model={this} visualOptions={onChange} ref={ref} />;
  }
}

export class ReferenceVis implements Vis {
  static type = 'reference';
  static font = 'link';
  static description = 'Reference';

  get type(): string {
    return ReferenceVis.type;
  }

  @field(types.String)
  readonly id: string;

  constructor(values: Values<ReferenceVis>) {
    this.id = values.id;
  }

  typeTitle(): string {
    return "Reference title";
  }

  renderEdit(onChange: (model: ReferenceVis) => void): any {
    return (
      <EditReferenceVis vis={this} onChange={onChange} />
    );
  }

  renderVisual(onChange: VisualOptions, ref?: (visual: VisComponent) => void) {
    return <ViewReferenceVis vis={this} visualOptions={onChange} ref={ref} />;
  }
}

export const VisType = types.SubTypes<Vis>([
  LineChart,
  BarChart,
  ReferenceVis
]);

export class LayoutEntry {
  @field(types.String)
  readonly i: string;
  @field(types.Number)
  readonly x: number;
  @field(types.Number)
  readonly y: number;
  @field(types.Number)
  readonly w: number;
  @field(types.Number)
  readonly h: number;

  constructor(values: Values<LayoutEntry>) {
    this.i = values.i;
    this.x = values.x;
    this.y = values.y;
    this.w = values.w;
    this.h = values.h;
  }
}

export class Component {
  @field(types.String)
  readonly id: string;
  @field(types.String)
  readonly title: string;
  @field(VisType)
  readonly visualization: Vis & HasType;

  constructor(values: Values<Component>) {
    this.id = values.id;
    this.title = values.title;
    this.visualization = values.visualization;
  }
}

export class Dashboard {
  @field(types.String)
  readonly id: string;
  @field(types.String)
  readonly title: string;
  @field(types.Map(types.String))
  readonly metadata: { [key: string]: string; };
  @field(types.Array(Component))
  readonly components: Component[];
  @field(types.Array(LayoutEntry))
  readonly layout: Array<LayoutEntry>;
  @field(Range)
  readonly range: Range;

  constructor(values: Values<Dashboard>) {
    this.id = values.id;
    this.title = values.title;
    this.metadata = values.metadata;
    this.components = values.components;
    this.layout = values.layout;
    this.range = values.range;
  }

  public getComponent(id: string): Optional<Component> {
    return ofNullable(this.components.find(c => c.id === id));
  }

  public getLayout(id: string): Optional<LayoutEntry> {
    return ofNullable(this.layout.find(c => c.i === id));
  }

  public withNewComponent(): Dashboard {
    const newComponents = this.components.slice();
    const layout = this.layout.slice();

    const newComponent = decode({
      id: this.newComponentId(),
      title: '',
      showTitle: true,
      visualization: {
        type: 'line-chart',
        stacked: false,
        zeroBased: false,
        dataSource: {
          type: 'embedded',
          query: ''
        }
      }
    }, Component);

    newComponents.push(newComponent);

    layout.push(decode({
      i: newComponent.id,
      x: 0,
      y: 0,
      w: 4,
      h: 2,
    }, LayoutEntry));

    return clone(this, {
      components: newComponents,
      layout: layout
    });
  }

  public newComponentId(): string {
    var attempts = 0;

    while (attempts++ < MAX_ATTEMPTS) {
      const next = 'c' + (randomId++ % RANGE).toString();

      if (!this.components.some(c => c.id === next)) {
        return next;
      }
    }

    throw new Error('Failed to allocated component ID');
  }

  public withoutComponent(component: Component) {
    const components = this.components.slice().filter(c => c.id !== component.id);
    return clone(this, { components: components });
  }

  public withReplacedComponent(component: Component) {
    const components = this.components.slice().map(c => {
      if (c.id === component.id) {
        return component;
      }

      return c;
    });

    return clone(this, { components: components });
  }

  public withLayout(layout: Array<LayoutEntry>): Dashboard {
    return clone(this, { layout: layout });
  }

  public withRange(range: Range): Dashboard {
    return clone(this, { range: range });
  }
}

export class DashboardEntry {
  @field(types.String)
  id: string;
  @field(types.String)
  title: string;
  @field(types.Map(types.String))
  metadata: { [key: string]: string; };
  @field(types.Boolean)
  starred: boolean;
}

export const DEFAULT_REFERENCE = decode({
  id: ""
}, ReferenceVis);

export const DEFAULT_LINE_CHART = decode({
  stacked: false,
  padding: 10,
  ticksGoal: 120,
  gridLineSpace: 30,
  zeroBased: false,
  dataSource: DEFAULT_EMBEDDED_DATA_SOURCE
}, LineChart);

export const DEFAULT_BAR_CHART = decode({
  stacked: false,
  padding: 10,
  ticksGoal: 30,
  gridLineSpace: 30,
  gap: 5,
  dataSource: DEFAULT_EMBEDDED_DATA_SOURCE
}, BarChart);

export interface HasType {
  type: string;
}

interface DataSourceConstructor extends Constructor<DataSource> {
  type: string;
  font: string;
  description: string;
}

interface VisualizationConstructor extends Constructor<Vis> {
  type: string;
  font: string;
  description: string;
}

export const DATA_SOURCE_TYPES: [DataSourceConstructor, DataSource & HasType][] = [
  [ReferenceDataSource, DEFAULT_REFERENCE_DATA_SOURCE],
  [EmbeddedDataSource, DEFAULT_EMBEDDED_DATA_SOURCE],
];

export const VISUALIZATION_TYPES: [VisualizationConstructor, Vis & HasType][] = [
  [ReferenceVis, DEFAULT_REFERENCE],
  [LineChart, DEFAULT_LINE_CHART],
  [BarChart, DEFAULT_BAR_CHART]
];
