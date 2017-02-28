import React from 'react';
import { decode, field, clone, TypeField, ArrayField, Constructor } from 'mapping';
import { Optional, ofNullable } from 'optional';
import EditBarChart from 'components/EditBarChart';
import ViewBarChart from 'components/ViewBarChart';
import EditLineChart from 'components/EditLineChart';
import ViewLineChart from 'components/ViewLineChart';
import ViewVisualizationReference from 'components/ViewVisualizationReference';
import EditVisualizationReference from 'components/EditVisualizationReference';

const MAX_ATTEMPTS = 1000;
const RANGE = 1000000;

var randomId = Math.round(Math.random() * RANGE);

export interface DataSource {
}

export class DataSourceData implements DataSource {
  @field()
  readonly query: string;

  constructor(values: any) {
    this.query = values.query;
  }

  static type = 'embedded';
}

export class DataSourceReference implements DataSource {
  @field()
  readonly id: string;

  constructor(values: any) {
    this.id = values.id;
  }

  static type = 'reference';
}

export const DataSourceType = TypeField.of<DataSource>([DataSourceData, DataSourceReference]);

export interface EditOptions<T> {
  onChange: (value: T) => void;
}

export interface VisualOptions {
  height?: number;
}

export interface Visualization {
  type: string;

  typeTitle(): string;

  renderEdit(options: EditOptions<this>): any;

  renderVisual(options: VisualOptions): any;
}


export class LineChart implements Visualization {
  static type = "line-chart";

  type: string;

  @field()
  stacked: boolean;
  @field({ type: DataSourceType })
  datasource: DataSource;

  constructor(values: any) {
    this.type = LineChart.type;
    this.stacked = values.stacked;
    this.datasource = values.datasource;
  }

  typeTitle(): string {
    return "Line Chart";
  }

  renderEdit(options: EditOptions<LineChart>): any {
    return (
      <EditLineChart lineChart={this} editOptions={options} />
    );
  }

  renderVisual(options: VisualOptions) {
    return <ViewLineChart lineChart={this} visualOptions={options} />;
  }
}

export class BarChart implements Visualization {
  static type = "bar-chart";

  type: string;

  @field()
  stacked: boolean;
  @field({ type: DataSourceType })
  datasource: DataSource;

  constructor(values: any) {
    this.type = BarChart.type;
    this.stacked = values.stacked;
    this.datasource = values.datasource;
  }

  typeTitle(): string {
    return "Bar Chart";
  }

  renderEdit(): any {
    return (
      <EditBarChart barChart={this} />
    );
  }

  renderVisual(options: VisualOptions) {
    return <ViewBarChart barChart={this} visualOptions={options} />;
  }
}

export class VisualizationReference implements Visualization {
  type: string;

  @field()
  readonly id: string;

  constructor(values: any) {
    this.type = VisualizationReference.type;
    this.id = values.id;
  }

  typeTitle(): string {
    return "Reference title";
  }

  renderEdit(options: EditOptions<VisualizationReference>): any {
    return (
      <EditVisualizationReference visualizationReference={this} editOptions={options} />
    );
  }

  renderVisual(options: VisualOptions) {
    return <ViewVisualizationReference visualizationReference={this} visualOptions={options} />;
  }

  static type = 'reference';
}

export const VisualizationType = TypeField.of<Visualization>([
  LineChart,
  BarChart,
  VisualizationReference
]);

export class LayoutEntry {
  @field()
  readonly i: string;
  @field()
  readonly x: number;
  @field()
  readonly y: number;
  @field()
  readonly w: number;
  @field()
  readonly h: number;

  constructor(values: any) {
    this.i = values.i;
    this.x = values.x;
    this.y = values.y;
    this.w = values.w;
    this.h = values.h;
  }
}

export class Component {
  @field()
  readonly id: string;
  @field()
  readonly title: string;
  @field()
  readonly showTitle: boolean;
  @field({ type: VisualizationType })
  readonly visualization: Visualization;

  constructor(values: any) {
    this.id = values.id;
    this.title = values.title;
    this.showTitle = values.showTitle;
    this.visualization = values.visualization;
  }
}

export class Dashboard {
  @field()
  readonly id: string;
  @field()
  readonly title: string;
  @field()
  readonly metadata: { [key: string]: string; };
  @field({ type: new ArrayField(Component) })
  readonly components: Component[];
  @field()
  readonly layout: Array<LayoutEntry>;

  constructor(values: any) {
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
        datasource: {
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
  @field()
  id: string;
  @field()
  title: string;
  @field()
  metadata: { [key: string]: string; };
  @field()
  starred: boolean;
}

export const DEFAULT_REFERENCE = decode({
  id: ""
}, VisualizationReference);

export const DEFAULT_LINE_CHART = decode({
  stacked: false,
  datasource: { type: 'reference', id: "" }
}, LineChart);

export const DEFAULT_BAR_CHART = decode({
  stacked: false,
  datasource: { type: 'reference', id: "" }
}, BarChart);

interface VisualizationConstructor extends Constructor<Visualization> {
  type: string;
}

export const VISUALIZATION_TYPES: VisualizationConstructor[] = [
  VisualizationReference,
  LineChart,
  BarChart
];
