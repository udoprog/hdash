import * as React from 'react';
import { decode, field, clone, types, Constructor, Values, FieldType, Field, FieldOptions } from 'mapping';
import { Optional, ofNullable, of } from 'optional';
import EditBarChart from 'components/EditBarChart';
import ViewBarChart from 'components/ViewBarChart';
import EditLineChart from 'components/EditLineChart';
import ViewLineChart from 'components/ViewLineChart';
import ViewReferenceVis from 'components/ViewReferenceVis';
import EditReferenceVis from 'components/EditReferenceVis';

import EditEmbeddedDataSource from 'components/EditEmbeddedDataSource';
import EditReferenceDataSource from 'components/EditReferenceDataSource';

import { PagesContext } from 'api/interfaces';
import * as moment from 'moment';

const MAX_ATTEMPTS = 1000;
const RANGE = 1000000;

var randomId = Math.round(Math.random() * RANGE);

class MomentField implements Field<moment.Moment> {
  public readonly optional: boolean;
  public readonly descriptor: string;

  constructor(optional: boolean) {
    this.optional = optional;
    this.descriptor = 'Moment';
  }

  decode(value: any): moment.Moment {
    return moment(value);
  }

  encode(value: moment.Moment): any {
    return value.milliseconds();
  }

  equals(_a: moment.Moment, _b: moment.Moment): boolean {
    return false;
  }
}

class MomentFieldType implements FieldType<moment.Moment> {
  public static __ft: boolean = true;

  toField(options: FieldOptions): MomentField {
    return new MomentField(options.optional);
  }
}

export interface Range {
}

export class RelativeRange implements Range {
  static type: string = 'relative';

  get type(): string {
    return RelativeRange.type;
  }

  @field(types.Number)
  public readonly value: number;
  @field(types.String)
  public readonly unit: string;

  constructor(values: Values<RelativeRange>) {
    this.value = values.value;
    this.unit = values.unit;
  }
}

export class AbsoluteRange implements Range {
  static type: string = 'absolute';

  get type(): string {
    return RelativeRange.type;
  }

  @field(new MomentFieldType())
  public readonly start: moment.Moment;
  @field(new MomentFieldType())
  public readonly end: moment.Moment;

  constructor(values: Values<AbsoluteRange>) {
    this.start = values.start;
    this.end = values.end;
  }
}

export const RangeType = types.SubTypes<Range>([
  AbsoluteRange,
  RelativeRange
]);

export interface VisComponent {
  requery(): void;
}

export interface EditOptions<T> {
  onChange: (value: T) => void;
}

export interface VisualOptions {
  height?: number;
}

export interface DataSource {
  renderEdit(options: EditOptions<this>): any;

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

  renderEdit(options: EditOptions<EmbeddedDataSource>): any {
    return (
      <EditEmbeddedDataSource dataSource={this} editOptions={options} />
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

  renderEdit(options: EditOptions<ReferenceDataSource>): any {
    return (
      <EditReferenceDataSource dataSource={this} editOptions={options} />
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

  renderEdit(options: EditOptions<this>): any;

  renderVisual(options: VisualOptions, ref?: (visual: VisComponent) => void): any;
}

export class LineChart implements Vis {
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
  @field(DataSourceType)
  dataSource: DataSource & HasType;

  constructor(values: Values<LineChart>) {
    this.stacked = values.stacked;
    this.zeroBased = values.zeroBased;
    this.dataSource = values.dataSource;
  }

  typeTitle(): string {
    return "Line Chart";
  }

  renderEdit(options: EditOptions<LineChart>): any {
    return (
      <EditLineChart lineChart={this} editOptions={options} />
    );
  }

  renderVisual(options: VisualOptions, ref?: (visual: VisComponent) => void) {
    return <ViewLineChart model={this} visualOptions={options} ref={ref} />;
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
  gap: number;
  @field(DataSourceType)
  dataSource: DataSource & HasType;

  constructor(values: Values<BarChart>) {
    this.zeroBased = true;
    this.stacked = values.stacked;
    this.gap = values.gap;
    this.dataSource = values.dataSource;
  }

  typeTitle(): string {
    return "Bar Chart";
  }

  renderEdit(editOptions: EditOptions<BarChart>) {
    return (
      <EditBarChart barChart={this} editOptions={editOptions} />
    );
  }

  renderVisual(options: VisualOptions, ref?: (visual: VisComponent) => void): any {
    return <ViewBarChart model={this} visualOptions={options} ref={ref} />;
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

  renderEdit(options: EditOptions<ReferenceVis>): any {
    return (
      <EditReferenceVis vis={this} editOptions={options} />
    );
  }

  renderVisual(options: VisualOptions, ref?: (visual: VisComponent) => void) {
    return <ViewReferenceVis vis={this} visualOptions={options} ref={ref} />;
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

  constructor(values: Values<Dashboard>) {
    this.id = values.id;
    this.title = values.title;
    this.metadata = values.metadata;
    this.components = values.components;
    this.layout = values.layout;
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
  zeroBased: false,
  dataSource: DEFAULT_EMBEDDED_DATA_SOURCE
}, LineChart);

export const DEFAULT_BAR_CHART = decode({
  gap: 5,
  stacked: false,
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
